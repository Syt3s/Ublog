import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { userService, type User } from '../services/apiServices';
import { ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadUser = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
      setFormData({
        nickname: userData.nickname || '',
        email: userData.email || '',
        phone: userData.phone || '',
      });
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (!user) return;
      await userService.updateUser(user.userID, formData);
      await loadUser();
      alert('个人资料更新成功');
    } catch (err: any) {
      setError(err.response?.data?.message || '更新个人资料失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首页
        </Button>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">个人资料</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label>用户名</Label>
                  <Input value={user?.username || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname">昵称</Label>
                  <Input
                    id="nickname"
                    name="nickname"
                    placeholder="请输入昵称"
                    value={formData.nickname}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="请输入邮箱"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="请输入手机号"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600">{error}</div>
                )}
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? '保存中...' : '保存更改'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">账户信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">用户ID： </span>
                {user?.userID}
              </div>
              <div>
                <span className="text-gray-600">文章总数： </span>
                {user?.postCount}
              </div>
              <div>
                <span className="text-gray-600">注册时间： </span>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
