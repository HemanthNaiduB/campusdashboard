'use client';


import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  AcademicCapIcon, 
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      try { localStorage.removeItem('dashboardFilters'); } catch {}
      router.push('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Campus Hiring Dashboard
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Streamline your recruitment process</p>
              </div>
            </div>
            
            {/* User Info and Sign Out */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.email?.split('@')[0] || 'Admin'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              
              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-smooth font-medium"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>


    </div>
  );
}