package fetcher

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/onexstack/miniblog/internal/apiserver/model"
)

type HackerNewsFetcher struct {
	client      *http.Client
	baseURL     string
	keywords    []string
	maxArticles int
}

func NewHackerNewsFetcher(keywords []string, maxArticles int) *HackerNewsFetcher {
	return &HackerNewsFetcher{
		client:      &http.Client{Timeout: 30 * time.Second},
		baseURL:     "https://hacker-news.firebaseio.com/v0",
		keywords:    keywords,
		maxArticles: maxArticles,
	}
}

func (f *HackerNewsFetcher) Name() string {
	return "hackernews"
}

func (f *HackerNewsFetcher) Fetch(ctx context.Context, limit int) ([]*model.AINewsM, error) {
	if limit > f.maxArticles {
		limit = f.maxArticles
	}

	storyIDs, err := f.getNewStories(ctx)
	if err != nil {
		return nil, err
	}

	newsList := make([]*model.AINewsM, 0, limit)
	processedCount := 0

	for _, id := range storyIDs {
		if processedCount >= limit {
			break
		}

		story, err := f.getStory(ctx, id)
		if err != nil {
			continue
		}

		if story == nil || story.Type != "story" || story.URL == "" {
			continue
		}

		if !f.isAIRelated(story.Title, story.Text) {
			continue
		}

		summary := strings.TrimSpace(story.Text)
		if summary == "" {
			summary = strings.TrimSpace(story.Title)
		}
		if len(summary) > 200 {
			summary = summary[:200] + "..."
		}

		author := story.By
		if author == "" {
			author = "Unknown"
		}

		news := &model.AINewsM{
			NewsID:         uuid.New().String(),
			Title:          story.Title,
			Summary:        summary,
			ContentURL:     story.URL,
			SourcePlatform: "hackernews",
			SourceAuthor:   author,
			PublishedAt:    time.Unix(story.Time, 0),
			FetchedAt:      time.Now(),
			Tags:           "HackerNews",
			ViewCount:      int64(story.Score),
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		}

		newsList = append(newsList, news)
		processedCount++
	}

	return newsList, nil
}

func (f *HackerNewsFetcher) getNewStories(ctx context.Context) ([]int, error) {
	url := fmt.Sprintf("%s/newstories.json", f.baseURL)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := f.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("hacker news API returned status: %d", resp.StatusCode)
	}

	var storyIDs []int
	if err := json.NewDecoder(resp.Body).Decode(&storyIDs); err != nil {
		return nil, err
	}

	return storyIDs, nil
}

func (f *HackerNewsFetcher) getStory(ctx context.Context, id int) (*HackerNewsStory, error) {
	url := fmt.Sprintf("%s/item/%d.json", f.baseURL, id)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := f.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("hacker news API returned status: %d", resp.StatusCode)
	}

	var story HackerNewsStory
	if err := json.NewDecoder(resp.Body).Decode(&story); err != nil {
		return nil, err
	}

	return &story, nil
}

func (f *HackerNewsFetcher) isAIRelated(title, text string) bool {
	content := strings.ToLower(title + " " + text)

	AIKeywords := []string{"ai", "artificial intelligence", "machine learning",
		"deep learning", "neural network", "llm", "large language model",
		"gpt", "transformer", "chatgpt", "openai", "nlp", "natural language",
		"computer vision", "reinforcement learning", "generative ai"}

	for _, keyword := range AIKeywords {
		if strings.Contains(content, keyword) {
			return true
		}
	}

	return false
}

type HackerNewsStory struct {
	By    string `json:"by"`
	ID    int    `json:"id"`
	Score int    `json:"score"`
	Time  int64  `json:"time"`
	Title string `json:"title"`
	Type  string `json:"type"`
	URL   string `json:"url"`
	Text  string `json:"text"`
}
