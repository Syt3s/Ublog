package model

import (
	"time"
)

const TableNameAINewsM = "ai_news"

type AINewsM struct {
	ID             int64     `gorm:"column:id;primaryKey;autoIncrement:true" json:"id"`
	NewsID         string    `gorm:"column:newsID;not null;uniqueIndex:idx_ai_news_newsID;comment:AI资讯唯一ID" json:"newsID"`
	Title          string    `gorm:"column:title;not null;comment:资讯标题" json:"title"`
	Summary        string    `gorm:"column:summary;comment:资讯摘要" json:"summary"`
	ContentURL     string    `gorm:"column:contentURL;not null;uniqueIndex:idx_ai_news_contentURL;comment:原始内容URL" json:"contentURL"`
	SourcePlatform string    `gorm:"column:sourcePlatform;not null;index:idx_ai_news_platform;comment:来源平台" json:"sourcePlatform"`
	SourceAuthor   string    `gorm:"column:sourceAuthor;comment:原作者" json:"sourceAuthor"`
	PublishedAt    time.Time `gorm:"column:publishedAt;comment:发布时间" json:"publishedAt"`
	FetchedAt      time.Time `gorm:"column:fetchedAt;not null;default:current_timestamp;comment:抓取时间" json:"fetchedAt"`
	Tags           string    `gorm:"column:tags;comment:标签(JSON格式)" json:"tags"`
	ViewCount      int64     `gorm:"column:viewCount;not null;default:0;comment:阅读次数" json:"viewCount"`
	CreatedAt      time.Time `gorm:"column:createdAt;not null;default:current_timestamp;comment:创建时间" json:"createdAt"`
	UpdatedAt      time.Time `gorm:"column:updatedAt;not null;default:current_timestamp;comment:更新时间" json:"updatedAt"`
}

func (*AINewsM) TableName() string {
	return TableNameAINewsM
}
