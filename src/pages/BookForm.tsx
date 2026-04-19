import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { ChevronLeft, Info, HelpCircle, Save, Loader2 } from 'lucide-react';

export default function BookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    isbn: '',
    coverUrl: '',
    publisher: '',
    categories: '',
    pdfUrl: '',
    directLink: '',
    description: '',
  });

  useEffect(() => {
    if (isEdit) {
      const fetchBook = async () => {
        const docRef = doc(db, 'books', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            ...formData,
            ...data,
            categories: data.categories?.join(', ') || '',
          });
        }
        setInitialLoading(false);
      };
      fetchBook();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Book name is required!");
    if (!user) return;

    setLoading(true);
    const bookData = {
      ...formData,
      categories: formData.categories.split(',').map(c => c.trim()).filter(c => c !== ''),
      updatedAt: serverTimestamp(),
    };

    try {
      if (isEdit) {
        await updateDoc(doc(db, 'books', id), bookData);
      } else {
        await addDoc(collection(db, 'books'), {
          ...bookData,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
        });
      }
      navigate('/admin');
    } catch (err) {
      console.error(err);
      alert("Failed to save book.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-20 text-center text-neutral-400">Loading book data...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="space-y-1">
        <h1 className="text-3xl font-serif font-bold text-neutral-900">{isEdit ? 'Edit Volume' : 'Add New Volume'}</h1>
        <p className="text-sm text-neutral-500">Only the name is required. All other fields are optional.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-brand-border shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted flex items-center gap-2">
              Book Name *
              <Info className="w-3 h-3 text-brand-primary" />
            </label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. The Great Gatsby"
              className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all text-brand-text font-bold text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all text-brand-text"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">ISBN</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all font-mono text-brand-text"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Categories</label>
            <input
              type="text"
              value={formData.categories}
              onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
              placeholder="History, Science, etc."
              className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all text-brand-text"
            />
          </div>

          <div className="p-6 bg-brand-accent rounded-xl border border-brand-primary/10 space-y-4">
            <div className="flex items-center gap-2 text-brand-primary font-black text-[10px] uppercase tracking-[0.2em]">
              <HelpCircle className="w-4 h-4" />
              Digital Source
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-brand-primary/60">Google Drive Link</label>
              <input
                type="url"
                value={formData.pdfUrl}
                onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-brand-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Summary</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all resize-none text-sm text-brand-text"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pb-20">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-white border border-brand-border text-brand-text rounded-lg font-bold hover:bg-brand-bg transition-all"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            type="submit"
            className="px-10 py-3 bg-brand-primary text-white rounded-lg font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-brand-primary/20 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Record
          </button>
        </div>
      </form>
    </div>
  );
}
