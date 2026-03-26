import { create } from 'zustand';
import { databaseService } from '../services/databaseService';
import type { Course, Lesson } from '../types/minicursos';

interface MinicursosState {
  courses: Course[];
  isLoading: boolean;
  userProgress: Record<string, number>;
  loadCourses: () => Promise<void>;
  updateProgress: (courseId: string, lessonId: string, progress: number) => Promise<void>;
  isAdmin: boolean;
}

export const useMinicursosStore = create<MinicursosState>((set, get) => ({
  courses: [],
  isLoading: false,
  userProgress: {},
  isAdmin: false,
  loadCourses: async () => {
    set({ isLoading: true });
    try {
      const courses = await databaseService.getMinicursos();
      set({ courses });
    } catch (error) {
      console.error('Failed to load minicursos:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  updateProgress: async (courseId: string, lessonId: string, progress: number) => {
    try {
      await databaseService.updateMinicursoProgress(courseId, lessonId, progress);
      set(state => ({
        userProgress: {
          ...state.userProgress,
          [`${courseId}-${lessonId}`]: progress
        }
      }));
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }
}));

