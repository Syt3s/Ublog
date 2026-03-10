package fetcher

import (
	"context"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/onexstack/miniblog/internal/apiserver/model"
)

type ArxivFetcher struct {
	client      *http.Client
	baseURL     string
	categories  []string
	maxArticles int
}

func NewArxivFetcher(categories []string, maxArticles int) *ArxivFetcher {
	return &ArxivFetcher{
		client:      &http.Client{Timeout: 30 * time.Second},
		baseURL:     "http://export.arxiv.org/api/query",
		categories:  categories,
		maxArticles: maxArticles,
	}
}

func (f *ArxivFetcher) Name() string {
	return "arxiv"
}

func (f *ArxivFetcher) Fetch(ctx context.Context, limit int) ([]*model.AINewsM, error) {
	if limit > f.maxArticles {
		limit = f.maxArticles
	}

	categoryQuery := ""
	if len(f.categories) > 0 {
		categoryQuery = strings.Join(f.categories, " OR ")
	}

	query := fmt.Sprintf("cat:%s&start=0&max_results=%d&sortBy=submittedDate&sortOrder=descending", categoryQuery, limit)
	url := fmt.Sprintf("%s?search_query=%s", f.baseURL, query)

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
		return nil, fmt.Errorf("arxiv API returned status: %d", resp.StatusCode)
	}

	return f.parseXML(resp.Body)
}

func (f *ArxivFetcher) parseXML(body io.Reader) ([]*model.AINewsM, error) {
	var arxivFeed ArxivFeed
	if err := xml.NewDecoder(body).Decode(&arxivFeed); err != nil {
		return nil, err
	}

	newsList := make([]*model.AINewsM, 0, len(arxivFeed.Entries))
	now := time.Now()

	for _, entry := range arxivFeed.Entries {
		summary := strings.TrimSpace(entry.Summary)
		if len(summary) > 200 {
			summary = summary[:200] + "..."
		}

		news := &model.AINewsM{
			NewsID:         uuid.New().String(),
			Title:          entry.Title,
			Summary:        summary,
			ContentURL:     entry.ID,
			SourcePlatform: "arxiv",
			SourceAuthor:   strings.Join(entry.Authors, ", "),
			PublishedAt:    entry.Published,
			FetchedAt:      now,
			Tags:           strings.Join(entry.Categories, ","),
			ViewCount:      0,
			CreatedAt:      now,
			UpdatedAt:      now,
		}

		newsList = append(newsList, news)
	}

	return newsList, nil
}

type ArxivFeed struct {
	XMLName xml.Name `xml:"feed"`
	Entries []Entry  `xml:"entry"`
}

type Entry struct {
	Title      string    `xml:"title"`
	ID         string    `xml:"id"`
	Summary    string    `xml:"summary"`
	Published  time.Time `xml:"published"`
	Updated    time.Time `xml:"updated"`
	Authors    []string  `xml:"author>name"`
	Categories []string  `xml:"category,attr"`
	Links      []Link    `xml:"link"`
}

type Link struct {
	Href string `xml:"href,attr"`
	Type string `xml:"type,attr"`
	Rel  string `xml:"rel,attr"`
}
