package ainews

import (
	"context"
	"time"

	"github.com/onexstack/miniblog/internal/apiserver/biz/v1/ai_news/fetcher"
	"github.com/onexstack/miniblog/internal/apiserver/model"
	"github.com/onexstack/miniblog/internal/apiserver/pkg/conversion"
	"github.com/onexstack/miniblog/internal/apiserver/store"
	"github.com/onexstack/miniblog/internal/pkg/log"
	apiv1 "github.com/onexstack/miniblog/pkg/api/apiserver/v1"
	"github.com/onexstack/onexstack/pkg/store/where"
)

type AINewsBiz interface {
	List(ctx context.Context, rq *apiv1.ListAINewsRequest) (*apiv1.ListAINewsResponse, error)
	Get(ctx context.Context, rq *apiv1.GetAINewsRequest) (*apiv1.GetAINewsResponse, error)
	Refresh(ctx context.Context, rq *apiv1.RefreshAINewsRequest) (*apiv1.RefreshAINewsResponse, error)
	StartAutoRefresh(ctx context.Context, interval time.Duration)
	StopAutoRefresh()

	AINewsExpansion
}

type AINewsExpansion interface{}

type aiNewsBiz struct {
	store      store.IStore
	fetcherMgr *fetcher.FetcherManager
	ticker     *time.Ticker
	stopCh     chan struct{}
	logger     log.Logger
}

var _ AINewsBiz = (*aiNewsBiz)(nil)

func New(store store.IStore) *aiNewsBiz {
	biz := &aiNewsBiz{
		store:      store,
		fetcherMgr: fetcher.NewFetcherManager(),
		stopCh:     make(chan struct{}),
		logger:     log.L(),
	}

	biz.initFetchers()

	return biz
}

func (b *aiNewsBiz) initFetchers() {
	arxivFetcher := fetcher.NewArxivFetcher([]string{"cs.AI", "cs.LG", "cs.CL", "cs.CV"}, 20)
	hackerNewsFetcher := fetcher.NewHackerNewsFetcher([]string{"AI", "machine learning", "LLM"}, 20)
	githubFetcher := fetcher.NewGitHubFetcher([]string{
		"openai/openai-cookbook",
		"microsoft/semantic-kernel",
		"langchain-ai/langchain",
	}, 20)

	b.fetcherMgr.RegisterFetcher(arxivFetcher)
	b.fetcherMgr.RegisterFetcher(hackerNewsFetcher)
	b.fetcherMgr.RegisterFetcher(githubFetcher)
}

func (b *aiNewsBiz) List(ctx context.Context, rq *apiv1.ListAINewsRequest) (*apiv1.ListAINewsResponse, error) {
	whr := where.T(ctx).P(int(rq.GetOffset()), int(rq.GetLimit()))
	if rq.GetSourcePlatform() != nil {
		whr.F("sourcePlatform", rq.GetSourcePlatform().GetValue())
	}

	count, newsList, err := b.store.AINews().List(ctx, whr)
	if err != nil {
		return nil, err
	}

	news := make([]*apiv1.AINews, 0, len(newsList))
	for _, item := range newsList {
		converted := conversion.AINewsModelToAINewsV1(item)
		news = append(news, converted)
	}

	return &apiv1.ListAINewsResponse{TotalCount: count, NewsList: news}, nil
}

func (b *aiNewsBiz) Get(ctx context.Context, rq *apiv1.GetAINewsRequest) (*apiv1.GetAINewsResponse, error) {
	whr := where.T(ctx).F("newsID", rq.GetId())
	newsM, err := b.store.AINews().Get(ctx, whr)
	if err != nil {
		return nil, err
	}

	return &apiv1.GetAINewsResponse{News: conversion.AINewsModelToAINewsV1(newsM)}, nil
}

func (b *aiNewsBiz) Refresh(ctx context.Context, rq *apiv1.RefreshAINewsRequest) (*apiv1.RefreshAINewsResponse, error) {
	platforms := rq.GetPlatforms()
	if len(platforms) == 0 {
		results, err := b.fetcherMgr.FetchAll(ctx, 20)
		if err != nil {
			return nil, err
		}

		for platform, newsList := range results {
			if err := b.saveNews(ctx, newsList); err != nil {
				b.logger.Errorw("Failed to save news",
					"platform", platform,
					"error", err)
			}
		}
	} else {
		for _, platform := range platforms {
			newsList, err := b.fetcherMgr.FetchByName(ctx, platform, 20)
			if err != nil {
				b.logger.Errorw("Failed to fetch news",
					"platform", platform,
					"error", err)
				continue
			}

			if err := b.saveNews(ctx, newsList); err != nil {
				b.logger.Errorw("Failed to save news",
					"platform", platform,
					"error", err)
			}
		}
	}

	return &apiv1.RefreshAINewsResponse{Message: "AI资讯刷新成功"}, nil
}

func (b *aiNewsBiz) saveNews(ctx context.Context, newsList []*model.AINewsM) error {
	for _, news := range newsList {
		whr := where.T(ctx).F("contentURL", news.ContentURL)
		existing, err := b.store.AINews().Get(ctx, whr)
		if err == nil && existing != nil {
			continue
		}

		if err := b.store.AINews().Create(ctx, news); err != nil {
			b.logger.Errorw("Failed to create news",
				"title", news.Title,
				"error", err)
		}
	}
	return nil
}

func (b *aiNewsBiz) StartAutoRefresh(ctx context.Context, interval time.Duration) {
	if b.ticker != nil {
		return
	}

	b.ticker = time.NewTicker(interval)

	go func() {
		for {
			select {
			case <-b.ticker.C:
				b.logger.Infow("Auto-refreshing AI news...")
				_, err := b.Refresh(ctx, &apiv1.RefreshAINewsRequest{})
				if err != nil {
					b.logger.Errorw("Auto-refresh failed", "error", err)
				} else {
					b.logger.Infow("Auto-refresh completed successfully")
				}
			case <-b.stopCh:
				return
			}
		}
	}()

	b.logger.Infow("Auto-refresh started", "interval", interval.String())
}

func (b *aiNewsBiz) StopAutoRefresh() {
	if b.ticker != nil {
		b.ticker.Stop()
		b.ticker = nil
		close(b.stopCh)
		b.stopCh = make(chan struct{})
		b.logger.Infow("Auto-refresh stopped")
	}
}
