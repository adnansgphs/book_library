import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { auth } from './lib/firebase';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Library, BookOpen, User as UserIcon, LogOut, Plus, Search, Filter, Settings, FileText, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Pages
import Catalog from './pages/Catalog';
import Blog from './pages/Blog';
import AdminDashboard from './pages/AdminDashboard';
import BookForm from './pages/BookForm';
import BlogForm from './pages/BlogForm';

const Navbar = () => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { label: 'Catalog', path: '/', icon: Library },
    { label: 'Blog', path: '/blog', icon: BookOpen },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin', path: '/admin', icon: LayoutDashboard });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-brand-border h-16 shrink-0">
      <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-brand-primary text-white rounded-lg flex items-center justify-center font-black text-xl">
              A
            </div>
            <span className="text-xl font-bold tracking-tight text-brand-text group-hover:text-brand-primary transition-colors">Aurelian</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                  location.pathname === item.path 
                    ? "bg-brand-accent text-brand-primary" 
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-bg md:bg-transparent"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!loading && (
            user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 pr-4 border-r border-brand-border hidden sm:flex">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-brand-text leading-none">{user.displayName}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1">Admin</span>
                  </div>
                  {user.photoURL && (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-brand-border" referrerPolicy="no-referrer" />
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-brand-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="px-5 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-bold hover:shadow-lg hover:shadow-brand-primary/20 transition-all flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                Sign In
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <div className="p-20 text-center text-neutral-500">Access Denied. Admins only.</div>;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-brand-bg flex flex-col">
          <Navbar />
          <main className="flex-1 flex overflow-hidden">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Catalog />} />
                <Route path="/blog" element={<Blog />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/books/new" element={<AdminRoute><BookForm /></AdminRoute>} />
                <Route path="/admin/books/edit/:id" element={<AdminRoute><BookForm /></AdminRoute>} />
                <Route path="/admin/blog/new" element={<AdminRoute><BlogForm /></AdminRoute>} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
