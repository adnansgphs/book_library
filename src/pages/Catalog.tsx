import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Book, BlogPost } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, BookOpen, ExternalLink, X, Info, Edit, ArrowRight, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { Link } from 'react-router-dom';

export default function Catalog() {
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Books');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const qBooks = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
    const unsubBooks = onSnapshot(qBooks, (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
      setLoading(false);
    });

    const qPosts = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'), limit(3));
    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      setRecentPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
    });

    return () => { unsubBooks(); unsubPosts(); };
  }, []);

  const categories = ['All Books', ...Array.from(new Set(books.flatMap(b => b.categories || [])))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.isbn?.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All Books' || book.categories?.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-1 w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-brand-border bg-white hidden lg:flex flex-col p-6 overflow-y-auto shrink-0">
        <div className="space-y-8 h-full flex flex-col">
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-muted px-2">Categories</h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex justify-between items-center group",
                    selectedCategory === cat 
                      ? "bg-brand-accent text-brand-primary font-bold shadow-sm" 
                      : "text-brand-text hover:bg-brand-bg md:hover:bg-brand-bg/50"
                  )}
                >
                  {cat}
                  <span className={cn(
                    "text-[10px] px-1.5 rounded transition-colors",
                    selectedCategory === cat ? "bg-brand-primary/10" : "bg-brand-bg text-brand-muted group-hover:bg-brand-border"
                  )}>
                    {cat === 'All Books' ? books.length : books.filter(b => b.categories?.includes(cat)).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-muted px-2">Publishers</h3>
            <div className="space-y-1">
              {['Penguin Random', 'HarperCollins', 'O\'Reilly'].map(pub => (
                <div key={pub} className="px-3 py-2 text-sm text-brand-muted hover:text-brand-text cursor-pointer transition-colors">
                  {pub}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-brand-border space-y-4">
            <h4 className="text-sm font-bold text-brand-text px-2">Recent Journal</h4>
            <div className="space-y-3">
              {recentPosts.map(post => (
                <Link key={post.id} to="/blog" className="block px-2 space-y-1 group">
                  <p className="text-[11px] text-brand-text font-semibold line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">• {post.title}</p>
                  <p className="text-[10px] text-brand-muted">Library update</p>
                </Link>
              ))}
              {recentPosts.length === 0 && <p className="text-[11px] text-brand-muted px-2 italic">Nothing yet.</p>}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Catalog View */}
      <section className="flex-1 overflow-y-auto bg-brand-bg p-8">
        <div className="max-w-[1100px] mx-auto space-y-8">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-brand-text tracking-tight">Library Catalog</h2>
              <p className="text-sm text-brand-muted">Managing {books.length} titles in digital repository</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Search by title, author or ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all shadow-sm"
                />
              </div>
              {isAdmin && (
                <Link
                  to="/admin/books/new"
                  className="w-full sm:w-auto px-5 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-bold hover:shadow-lg hover:shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-3.5" />
                  Add Book
                </Link>
              )}
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white border border-brand-border rounded-xl p-3 space-y-3 animate-pulse">
                    <div className="aspect-[2/3] bg-brand-bg rounded-lg" />
                    <div className="h-4 bg-brand-bg rounded w-3/4" />
                    <div className="h-3 bg-brand-bg rounded w-1/2" />
                  </div>
                ))
              ) : (
                filteredBooks.map((book) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className="relative group bg-white border border-brand-border rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    {isAdmin && (
                      <Link 
                        to={`/admin/books/edit/${book.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-4 right-4 z-10 p-2 bg-white shadow-sm border border-brand-border rounded-lg text-brand-muted hover:text-brand-primary hover:border-brand-primary transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    
                    <div className="aspect-[2/3] overflow-hidden rounded-lg bg-brand-bg mb-4">
                      <img
                        src={book.coverUrl || `https://picsum.photos/seed/${book.name}/400/600`}
                        alt={book.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="font-bold text-brand-text truncate pr-8">{book.name}</h4>
                      <p className="text-xs text-brand-muted">{book.author || 'Unknown Author'}</p>
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {book.categories?.slice(0, 1).map(cat => (
                          <span key={cat} className="px-2 py-0.5 bg-brand-accent text-brand-primary text-[10px] font-bold uppercase tracking-wider rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {filteredBooks.length === 0 && !loading && (
            <div className="text-center py-32">
              <BookOpen className="w-12 h-12 text-brand-border mx-auto mb-4" />
              <h3 className="text-lg font-bold text-brand-text">No collection items found</h3>
              <p className="text-brand-muted text-sm">Your search criteria didn't match any titles.</p>
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal Component Re-implemented for Theme */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBook(null)} className="absolute inset-0 bg-brand-text/40 backdrop-blur-[2px]" />
            <motion.div 
              layoutId={selectedBook.id} 
              initial={{ opacity: 0, scale: 0.98, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-brand-border"
            >
              <button onClick={() => setSelectedBook(null)} className="absolute top-5 right-5 p-2 bg-white/50 hover:bg-white rounded-full z-10 shadow-sm border border-brand-border group">
                <X className="w-5 h-5 text-brand-text group-hover:text-brand-primary transition-colors" />
              </button>

              <div className="w-full md:w-5/12 aspect-[2/3] md:aspect-auto">
                <img src={selectedBook.coverUrl || `https://picsum.photos/seed/${selectedBook.name}/400/600`} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="w-full md:w-7/12 p-10 overflow-y-auto max-h-[85vh] md:max-h-[700px] flex flex-col gap-6">
                 <div>
                    <div className="flex gap-2 mb-3">
                      {selectedBook.categories?.map(c => <span key={c} className="bg-brand-accent text-brand-primary px-2 py-0.5 rounded text-[10px] font-black uppercase">{c}</span>)}
                    </div>
                    <h2 className="text-3xl font-black text-brand-text tracking-tighter leading-tight">{selectedBook.name}</h2>
                    <p className="text-brand-muted font-medium mt-1">{selectedBook.author}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-8 border-y border-brand-border py-6">
                    {selectedBook.isbn && (
                      <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">ISBN Reference</p>
                        <p className="text-sm font-mono text-brand-text">{selectedBook.isbn}</p>
                      </div>
                    )}
                    {selectedBook.publisher && (
                      <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Publisher</p>
                        <p className="text-sm text-brand-text">{selectedBook.publisher}</p>
                      </div>
                    )}
                 </div>

                 <div className="text-brand-muted text-sm leading-relaxed prose prose-slate max-w-none prose-p:my-0">
                    {selectedBook.description || 'This record exists in the repository without an accompanying summary.'}
                 </div>

                 <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-3">
                  {selectedBook.pdfUrl && (
                    <div className="flex-1 space-y-4">
                      <a href={selectedBook.pdfUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-3 rounded-lg text-sm font-bold shadow-lg shadow-brand-primary/10 hover:shadow-brand-primary/20 transition-all">
                        <BookOpen className="w-4 h-4" /> Open Reader
                      </a>
                      {selectedBook.pdfUrl.includes('drive.google.com') && (
                        <div className="aspect-[16/10] bg-brand-bg rounded-lg border border-brand-border overflow-hidden">
                           <iframe src={selectedBook.pdfUrl.replace('/view', '/preview')} className="w-full h-full" allow="autoplay" />
                        </div>
                      )}
                    </div>
                  )}
                  {selectedBook.directLink && (
                    <a href={selectedBook.directLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 border border-brand-border text-brand-text py-3 rounded-lg text-sm font-bold hover:bg-brand-bg transition-all">
                      <ExternalLink className="w-4 h-4" /> Digital Resource
                    </a>
                  )}
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
