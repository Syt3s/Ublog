import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '../lib/token';
import Navbar from '../components/Navbar';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!tokenStorage.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to MiniBlog</h1>
          <p className="text-gray-600 mb-8">A simple and elegant blogging platform</p>
        </div>
      </div>
    </div>
  );
}
