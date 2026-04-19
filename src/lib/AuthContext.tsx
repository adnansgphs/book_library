import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserMetadata } from '../types';

interface AuthContextType {
  user: User | null;
  metadata: UserMetadata | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  metadata: null,
  loading: true,
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [metadata, setMetadata] = useState<UserMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create user metadata
        const userRef = doc(db, 'users', user.uid);
        let userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const initialMetadata = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Anonymous',
            role: user.email === 'adnan.sgphs@gmail.com' ? 'admin' : 'user',
          };
          await setDoc(userRef, initialMetadata);
          setMetadata(initialMetadata as UserMetadata);
        } else {
          setMetadata(userSnap.data() as UserMetadata);
        }
      } else {
        setMetadata(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, metadata, loading, isAdmin: metadata?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
