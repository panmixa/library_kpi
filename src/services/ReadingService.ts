import api from './api';

interface ReadingProgress {
  bookId: string;
  currentPage: number;
  progress: number;
  userId?: string;
  totalPages?: number;
  status?: 'in_progress' | 'completed';
  lastReadAt?: Date;
}

class ReadingService {
  private readonly STORAGE_KEY = 'reading_progress';
  private readonly API_URL = '/reading-progress';

  private getProgressKey(bookId: string): string {
    return `${this.STORAGE_KEY}_${bookId}`;
  }

  async saveProgress(progress: ReadingProgress): Promise<void> {
    try {
      // Save to backend
      const userId = localStorage.getItem('user_id');
      if (userId) {
        await api.post(this.API_URL, {
          userId,
          bookId: progress.bookId,
          currentPage: progress.currentPage,
          percentageRead: progress.progress,
          updatedAt: new Date().toISOString()
        });
      }

      // Save to localStorage as fallback
      const key = this.getProgressKey(progress.bookId);
      localStorage.setItem(key, JSON.stringify({
        ...progress,
        lastReadAt: new Date(),
        status: progress.currentPage === progress.totalPages ? 'completed' : 'in_progress'
      }));
    } catch (error) {
      console.error('Error saving reading progress:', error);
      // If backend fails, still save to localStorage
      const key = this.getProgressKey(progress.bookId);
      localStorage.setItem(key, JSON.stringify({
        ...progress,
        lastReadAt: new Date(),
        status: progress.currentPage === progress.totalPages ? 'completed' : 'in_progress'
      }));
    }
  }

  async getProgress(bookId: string): Promise<ReadingProgress | null> {
    try {
      // Try to get from backend first
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const response = await api.get(`${this.API_URL}/${userId}`);
        const progressList = response.data;
        const bookProgress = progressList.find((p: any) => p.bookId === bookId);
        if (bookProgress) {
          return {
            bookId: bookProgress.bookId,
            currentPage: bookProgress.currentPage,
            progress: bookProgress.percentageRead,
            userId: bookProgress.userId,
            lastReadAt: new Date(bookProgress.updatedAt),
            status: 'in_progress'
          };
        }
      }
    } catch (error) {
      console.error('Error getting reading progress from backend:', error);
    }

    // Fallback to localStorage
    const key = this.getProgressKey(bookId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async getAllProgress(): Promise<Record<string, ReadingProgress>> {
    const progress: Record<string, ReadingProgress> = {};
    
    try {
      // Try to get from backend first
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const response = await api.get(`${this.API_URL}/${userId}`);
        const progressList = response.data;
        progressList.forEach((p: any) => {
          progress[p.bookId] = {
            bookId: p.bookId,
            currentPage: p.currentPage,
            progress: p.percentageRead,
            userId: p.userId,
            lastReadAt: new Date(p.updatedAt),
            status: 'in_progress'
          };
        });
        return progress;
      }
    } catch (error) {
      console.error('Error getting all reading progress from backend:', error);
    }

    // Fallback to localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_KEY)) {
        const bookId = key.replace(`${this.STORAGE_KEY}_`, '');
        const data = localStorage.getItem(key);
        if (data) {
          progress[bookId] = JSON.parse(data);
        }
      }
    }

    return progress;
  }

  async clearProgress(bookId: string): Promise<void> {
    try {
      // Clear from backend
      const userId = localStorage.getItem('user_id');
      if (userId) {
        await api.delete(`${this.API_URL}/${userId}/${bookId}`);
      }
    } catch (error) {
      console.error('Error clearing reading progress from backend:', error);
    }

    // Clear from localStorage
    const key = this.getProgressKey(bookId);
    localStorage.removeItem(key);
  }
}

export const readingService = new ReadingService();
export type { ReadingProgress };
