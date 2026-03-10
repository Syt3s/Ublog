package fetcher

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/onexstack/miniblog/internal/apiserver/model"
)

type GitHubFetcher struct {
	client      *http.Client
	baseURL     string
	repos       []string
	maxArticles int
}

func NewGitHubFetcher(repos []string, maxArticles int) *GitHubFetcher {
	return &GitHubFetcher{
		client:      &http.Client{Timeout: 30 * time.Second},
		baseURL:     "https://api.github.com",
		repos:       repos,
		maxArticles: maxArticles,
	}
}

func (f *GitHubFetcher) Name() string {
	return "github"
}

func (f *GitHubFetcher) Fetch(ctx context.Context, limit int) ([]*model.AINewsM, error) {
	if limit > f.maxArticles {
		limit = f.maxArticles
	}

	newsList := make([]*model.AINewsM, 0, limit)
	now := time.Now()

	for _, repo := range f.repos {
		if len(newsList) >= limit {
			break
		}

		releases, err := f.getReleases(ctx, repo)
		if err != nil {
			continue
		}

		for _, release := range releases {
			if len(newsList) >= limit {
				break
			}

			summary := strings.TrimSpace(release.Body)
			if len(summary) > 200 {
				summary = summary[:200] + "..."
			}

			author := release.Author.Login
			if author == "" {
				author = "Unknown"
			}

			news := &model.AINewsM{
				NewsID:         uuid.New().String(),
				Title:          release.Name,
				Summary:        summary,
				ContentURL:     release.HtmlUrl,
				SourcePlatform: "github",
				SourceAuthor:   author,
				PublishedAt:    release.PublishedAt,
				FetchedAt:      now,
				Tags:           repo,
				ViewCount:      0,
				CreatedAt:      now,
				UpdatedAt:      now,
			}

			newsList = append(newsList, news)
		}
	}

	return newsList, nil
}

func (f *GitHubFetcher) getReleases(ctx context.Context, repo string) ([]GitHubRelease, error) {
	url := fmt.Sprintf("%s/repos/%s/releases", f.baseURL, repo)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("User-Agent", "miniblog-ai-news")

	resp, err := f.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github API returned status: %d", resp.StatusCode)
	}

	var releases []GitHubRelease
	if err := json.NewDecoder(resp.Body).Decode(&releases); err != nil {
		return nil, err
	}

	return releases, nil
}

func decodeBase64Content(content string) (string, error) {
	decoder := base64.NewDecoder(base64.StdEncoding, strings.NewReader(content))
	decoded, err := io.ReadAll(decoder)
	if err != nil {
		return "", err
	}
	return string(decoded), nil
}

type GitHubRelease struct {
	TagName     string     `json:"tag_name"`
	Name        string     `json:"name"`
	Body        string     `json:"body"`
	HtmlUrl     string     `json:"html_url"`
	PublishedAt time.Time  `json:"published_at"`
	Author      GitHubUser `json:"author"`
}

type GitHubUser struct {
	Login string `json:"login"`
}

type GitHubContent struct {
	Content  string `json:"content"`
	Encoding string `json:"encoding"`
}
