import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { postService } from '../services/apiServices';
import { ArrowLeft } from 'lucide-react';

export default function EditPostPage() {
  const { postID } = useParams<{ postID: string }>();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPost = async () => {
      if (!postID) return;
      
      setInitialLoading(true);
      try {
        const post = await postService.getPost(postID);
        setFormData({
          title: post.title,
          content: post.content,
        });
      } catch (error) {
        console.error('Failed to load post:', error);
        navigate('/');
      } finally {
        setInitialLoading(false);
      }
    };

    loadPost();
  }, [postID, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await postService.updatePost(postID!, formData);
      navigate(`/posts/${postID}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '更新文章失败');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate(`/posts/${postID}`)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回文章
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">编辑文章</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="请输入文章标题"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">内容</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="请编写文章内容..."
                  value={formData.content}
                  onChange={handleChange}
                  rows={15}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '更新中...' : '更新文章'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
