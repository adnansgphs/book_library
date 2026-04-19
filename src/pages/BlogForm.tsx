import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { ChevronLeft, Save, Loader2, FileText, ImageIcon } from 'lucide-react';

export default function BlogForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return alert("Title and content are required!");
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'blogPosts'), {
        ...formData,
        authorId: user.uid,
        authorName: user.displayName || 'Administrator',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      navigate('/admin');
    } catch (err) {
      console.error(err);
      alert("Failed to publish post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto space-y-8 p-10">
      <header className="flex flex-col gap-2 border-b border-brand-border pb-8">
        <h1 className="text-3xl font-bold text-brand-text tracking-tight">New Journal Entry</h1>
        <p className="text-sm text-brand-muted">Craft an update for the Aurelian digital archive.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-brand-border shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Entry Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="The Renaissance of Digital Curation..."
              className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all text-xl font-bold text-brand-text"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Featured Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Journal Content (Markdown)</label>
              <span className="text-[10px] text-brand-primary bg-brand-accent px-2 py-0.5 rounded font-black uppercase">Editor</span>
            </div>
            <textarea
              required
              rows={12}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your thoughts here..."
              className="w-full px-4 py-4 bg-brand-bg border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all resize-none font-mono text-sm text-brand-text"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pb-20">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-white border border-brand-border text-brand-text rounded-lg font-bold hover:bg-brand-bg transition-all"
          >
            Discard
          </button>
          <button
            disabled={loading}
            type="submit"
            className="px-10 py-3 bg-brand-primary text-white rounded-lg font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-brand-primary/20 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Publish Entry
          </button>
        </div>
      </form>
    </div>
  );
}
