import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Book, BlogPost } from '../types';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Book as BookIcon, FileText, ChevronRight, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeTab, setActiveTab] = useState<'books' | 'posts'>('books');

  useEffect(() => {
    const qBooks = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
    const unsubBooks = onSnapshot(qBooks, (snap) => {
      setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Book)));
    });

    const qPosts = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'));
    const unsubPosts = onSnapshot(qPosts, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost)));
    });

    return () => { unsubBooks(); unsubPosts(); };
  }, []);

  const handleDeleteBook = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteDoc(doc(db, 'books', id));
    }
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete post "${title}"?`)) {
      await deleteDoc(doc(db, 'blogPosts', id));
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto space-y-8 p-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-border pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-brand-text tracking-tight">Dashboard</h1>
          <p className="text-sm text-brand-muted">Administrative controls for Aurelian digital assets.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/books/new"
            className="px-5 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-brand-primary/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Book
          </Link>
          <Link
            to="/admin/blog/new"
            className="px-5 py-2.5 bg-white border border-brand-border text-brand-text rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-bg transition-all"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-brand-border">
        <button
          onClick={() => setActiveTab('books')}
          className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'books' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'}`}
        >
          Books Catalogue ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'posts' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'}`}
        >
          Journal Entries ({posts.length})
        </button>
      </div>

      <div className="bg-white rounded-xl border border-brand-border overflow-hidden shadow-sm">
        {activeTab === 'books' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg border-b border-brand-border">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Collection Item</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Classification</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Registered</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-brand-bg/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <img src={book.coverUrl || `https://picsum.photos/seed/${book.name}/100/150`} alt="" className="w-10 h-14 object-cover rounded shadow-sm border border-brand-border" />
                        <span className="font-bold text-brand-text">{book.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-brand-text">{book.author || 'Anonymous'}</span>
                        <div className="flex gap-1 mt-2">
                          {book.categories?.slice(0, 2).map(c => (
                            <span key={c} className="text-[10px] bg-brand-accent px-2 py-0.5 rounded font-bold text-brand-primary uppercase">{c}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-brand-muted">
                      {format(book.createdAt.toDate(), 'MMM d, yyyy')}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/books/edit/${book.id}`} className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-accent rounded-lg transition-all">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteBook(book.id, book.name)}
                          className="p-2 text-brand-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {posts.map((post) => (
              <div key={post.id} className="p-8 flex items-center justify-between hover:bg-brand-bg transition-colors group">
                <div className="flex items-center gap-6">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt="" className="w-32 h-20 object-cover rounded-xl border border-brand-border shadow-sm" />
                  ) : (
                    <div className="w-32 h-20 bg-brand-bg rounded-xl border border-brand-border flex items-center justify-center">
                      <FileText className="w-6 h-6 text-brand-muted" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <h3 className="font-bold text-brand-text text-lg">{post.title}</h3>
                    <p className="text-[10px] text-brand-muted uppercase tracking-widest font-black">
                      {format(post.createdAt.toDate(), 'MMMM d, yyyy')} • {post.authorName}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => handleDeletePost(post.id, post.title)}
                    className="p-3 text-brand-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {(activeTab === 'books' ? books.length : posts.length) === 0 && (
          <div className="p-20 text-center space-y-3">
            <Settings className="w-10 h-10 text-neutral-200 mx-auto" />
            <p className="text-neutral-400 font-medium">No items found in this section.</p>
          </div>
        )}
      </div>
    </div>
  );
}
