import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'user';

export interface UserMetadata {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface Book {
  id: string;
  name: string;
  author?: string;
  isbn?: string;
  coverUrl?: string;
  publisher?: string;
  categories?: string[];
  pdfUrl?: string;
  directLink?: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
