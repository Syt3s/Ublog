import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { aiNewsService, type AINews } from '../services/apiServices';
import { ExternalLink, RefreshCw } from 'lucide-react';

const PLATFORM_COLORS: Record<string, string> = {
  arxiv: 'bg-blue-100 text-blue-800',
  hackernews: 'bg-orange-100 text-orange-800',
  github: 'bg-purple-100 text-purple-800',
};

const PLATFORM_NAMES: Record<string, string> = {
  arxiv: 'ArXiv',
  hackernews: 'Hacker News',
  github: 'GitHub',
};

export default function AINewsPage() {
  const [news, setNews] = useState<AINews[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const pageSize = 10;

  const loadNews = async () => {
    setLoading(true);
    try {
      const response = await aiNewsService.listAINews(
        page * pageSize, 
        pageSize, 
        selectedPlatform || undefined
      );
      setNews(response.newsList);
      setTotalCount(parseInt(response.totalCount));
    } catch (error) {
      console.error('Failed to load AI news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [page, selectedPlatform]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const platforms = selectedPlatform ? [selectedPlatform] : undefined;
      await aiNewsService.refreshAINews(platforms);
      await loadNews();
    } catch (error) {
      console.error('Failed to refresh AI news:', error);
      alert('刷新失败，请稍后重试');
    } finally {
      setRefreshing(false);
    }
  };

  const handlePlatformFilter = (platform: string) => {
    setSelectedPlatform(platform === selectedPlatform ? '' : platform);
    setPage(0);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">AI 资讯</h1>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            刷新资讯
          </Button>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            variant={selectedPlatform === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePlatformFilter('')}
          >
            全部平台
          </Button>
          <Button
            variant={selectedPlatform === 'arxiv' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePlatformFilter('arxiv')}
          >
            ArXiv
          </Button>
          <Button
            variant={selectedPlatform === 'hackernews' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePlatformFilter('hackernews')}
          >
            Hacker News
          </Button>
          <Button
            variant={selectedPlatform === 'github' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePlatformFilter('github')}
          >
            GitHub
          </Button>
        </div>

        {loading
? (
          <div className="text-center py-8">加载中...</div>
        ) : news.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            暂无AI资讯，点击上方"刷新资讯"按钮获取最新内容
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg line-clamp-2 flex-1">
                      {item.title}
                    </CardTitle>
                    <a
                      href={item.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <ExternalLink className="h-5 w-5 text-gray-500 hover:text-blue-600" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      PLATFORM_COLORS[item.sourcePlatform] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {PLATFORM_NAMES[item.sourcePlatform] || item.sourcePlatform}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {item.sourceAuthor && (
                    <div className="text-sm text-gray-600">
                      作者: {item.sourceAuthor}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 line-clamp-3 mb-4">
                    {item.summary || item.title}
                  </p>
                  <a
                    href={item.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                  >
                    阅读原文 <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              上一页
            </Button>
            <span className="px-4 py-2 text-sm">
              第 {page + 1} 页，共 {totalPages} 页
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
