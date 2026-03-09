import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { postService, type Post, userService, type User } from '../services/apiServices';
import { ArrowLeft, PenSquare, Trash2 } from 'lucide-react';

export default function PostDetailPage() {
  const { postID } = useParams<{ postID: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPost = async () => {
      if (!postID) return;
      
      setLoading(true);
      try {
        const postData = await postService.getPost(postID);
        setPost(postData);
        
        const authorData = await userService.getUser(postData.userID);
        setAuthor(authorData);
      } catch (error) {
        console.error('Failed to load post:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postID]);

  const handleDelete = async () => {
    if (!postID) return;
    if (window.confirm('确定要删除这篇文章吗？')) {
      try {
        await postService.deletePosts([postID]);
        navigate('/');
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('删除文章失败');
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!post) {
    return <div className="min-h-screen flex items-center justify-center">未找到文章</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回文章列表
        </Button>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">{post.title}</CardTitle>
            <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
              <span>
                作者：{author?.nickname || author?.username} • {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/posts/${postID}/edit`)}>
                  <PenSquare className="h-4 w-4 mr-2" />
                  编辑
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-gray-500">
              最后更新：{new Date(post.updatedAt).toLocaleString()}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
