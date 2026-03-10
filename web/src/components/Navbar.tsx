import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { User, FileText, LogOut, Cpu } from 'lucide-react';
import { tokenStorage } from '../lib/token';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = tokenStorage.isAuthenticated();

  const handleLogout = () => {
    tokenStorage.removeToken();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold hover:text-gray-700">
            UBlog
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                to="/ai-news"
                className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 ${
                  location.pathname === '/ai-news' ? 'bg-gray-100' : ''
                }`}
              >
                <Cpu className="h-4 w-4" />
                <span>AI资讯</span>
              </Link>
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 ${
                  location.pathname === '/' ? 'bg-gray-100' : ''
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>文章列表</span>
              </Link>
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 ${
                  location.pathname === '/profile' ? 'bg-gray-100' : ''
                }`}
              >
                <User className="h-4 w-4" />
                <span>个人资料</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>退出登录</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/ai-news"
                className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 ${
                  location.pathname === '/ai-news' ? 'bg-gray-100' : ''
                }`}
              >
                <Cpu className="h-4 w-4" />
                <span>AI资讯</span>
              </Link>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                登录
              </Button>
              <Button onClick={() => navigate('/register')}>
                注册
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
