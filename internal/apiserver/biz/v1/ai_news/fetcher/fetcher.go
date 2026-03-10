package fetcher

import (
	"context"
	"fmt"

	"github.com/onexstack/miniblog/internal/apiserver/model"
)

type Fetcher interface {
	Name() string
	Fetch(ctx context.Context, limit int) ([]*model.AINewsM, error)
}

type FetcherManager struct {
	fetchers []Fetcher
}

func NewFetcherManager() *FetcherManager {
	return &FetcherManager{
		fetchers: make([]Fetcher, 0),
	}
}

func (m *FetcherManager) RegisterFetcher(fetcher Fetcher) {
	m.fetchers = append(m.fetchers, fetcher)
}

func (m *FetcherManager) FetchAll(ctx context.Context, limitPerFetcher int) (map[string][]*model.AINewsM, error) {
	results := make(map[string][]*model.AINewsM)

	for _, fetcher := range m.fetchers {
		news, err := fetcher.Fetch(ctx, limitPerFetcher)
		if err != nil {
			continue
		}
		results[fetcher.Name()] = news
	}

	return results, nil
}

func (m *FetcherManager) FetchByName(ctx context.Context, name string, limit int) ([]*model.AINewsM, error) {
	for _, fetcher := range m.fetchers {
		if fetcher.Name() == name {
			return fetcher.Fetch(ctx, limit)
		}
	}
	return nil, fmt.Errorf("fetcher %s not found", name)
}
