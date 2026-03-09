import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { postService, type Post } from '../services/apiServices';
import { PenSquare, Trash2 } from 'lucide-react';

export default function PostListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTitle, setSearchTitle] = useState('');
  const navigate = useNavigate();
  const pageSize = 10;

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await postService.listPosts(page * pageSize, pageSize, searchTitle || undefined);
      setPosts(response.posts);
      setTotalCount(parseInt(response.totalCount));
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [page, searchTitle]);

  const handleDelete = async (postID: string) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      try {
        await postService.deletePosts([postID]);
        loadPosts();
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('删除文章失败');
      }
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">博客文章</h1>
          <Button onClick={() => navigate('/posts/new')}>
            <PenSquare className="mr-2 h-4 w-4" />
            新建文章
          </Button>
        </div>

        <div className="mb-6">
          <Input
            placeholder="按标题搜索文章..."
            value={searchTitle}
            onChange={(e) => {
              setSearchTitle(e.target.value);
              setPage(0);
            }}
            className="max-w-md"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-600">未找到文章</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.postID} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle 
                    className="text-xl"
                    onClick={() => navigate(`/posts/${post.postID}`)}
                  >
                    {post.title}
                  </CardTitle>
                  <div className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent>
                  <p 
                    className="text-gray-700 line-clamp-3 mb-4"
                    onClick={() => navigate(`/posts/${post.postID}`)}
                  >
                    {post.content}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/posts/${post.postID}/edit`)}
                    >
                      <PenSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(post.postID)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
