export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  fileUrl: string;
  createdAt: string;
  publicationYear: number;
  coverImage?: string;
  content: string[];
}

export interface BookFilters {
  genre?: string;
  author?: string;
}

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  progress: number;
  userId?: string;
  totalPages?: number;
  status?: 'in_progress' | 'completed';
  lastReadAt?: Date;
}
