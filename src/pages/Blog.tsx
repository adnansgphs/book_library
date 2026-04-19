import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BlogPost } from '../types';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="text-center space-y-4 py-12">
        <h1 className="text-5xl font-black text-brand-text tracking-tighter">The Library Journal</h1>
        <p className="text-brand-muted text-lg">Updates, essays, and literary explorations from the Aurelian collection.</p>
      </section>

      <div className="space-y-20 pb-20">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-video bg-white border border-brand-border rounded-2xl" />
              <div className="h-8 bg-white border border-brand-border rounded-xl w-3/4" />
            </div>
          ))
        ) : (
          posts.map((post, index) => (
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={post.id}
              className="group space-y-8"
            >
              {post.imageUrl && (
                <div className="aspect-video overflow-hidden rounded-3xl bg-white border border-brand-border shadow-sm transition-all group-hover:shadow-xl group-hover:shadow-brand-primary/5">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              
              <div className="space-y-6">
                <div className="flex items-center gap-6 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-brand-primary" />
                    {format(post.createdAt.toDate(), 'MMMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-brand-primary" />
                    {post.authorName}
                  </div>
                </div>
                
                <h2 className="text-4xl font-black text-brand-text leading-tight group-hover:text-brand-primary transition-colors cursor-pointer">
                  {post.title}
                </h2>
                
                <div className="prose prose-slate max-w-none prose-p:text-brand-text/80 prose-headings:text-brand-text">
                  <ReactMarkdown>
                    {post.content.length > 400 ? `${post.content.substring(0, 400)}...` : post.content}
                  </ReactMarkdown>
                </div>
                
                {post.content.length > 400 && (
                  <button className="flex items-center gap-2 text-sm font-bold text-brand-primary group/link">
                    Continue Reading
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                  </button>
                )}
              </div>
            </motion.article>
          ))
        )}

        {posts.length === 0 && !loading && (
          <div className="text-center py-20 bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-200">
            <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900">No journals yet</h3>
            <p className="text-neutral-500">Check back later for new updates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
