import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Course, Lesson } from '../types/minicursos';

// Access environment variables safely
const getEnvVar = (key: string): string => {
  // @ts-ignore - Vite specific environment variables
  return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[key] : undefined) || 
         (typeof process !== 'undefined' && process.env ? process.env[key] : '') || 
         '';
};

// Supabase client initialization
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Database operations may fail.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Database service that abstracts the underlying database implementation
export const databaseService = {
  // Get Supabase client (for direct access when needed)
  getClient(): SupabaseClient {
    return supabase;
  },

  // Authentication methods
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  async signUp(email: string, password: string, userData: any = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      
      // Create profile record
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: userData.fullName || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Site data methods
  async getSiteData() {
    try {
      const [
        { data: banners }, 
        { data: modules }, 
        { data: teachers }, 
        { data: learnings }, 
        { data: testimonials }, 
        { data: faqs },
        { data: settings }
      ] = await Promise.all([
        supabase.from('banners').select('*'),
        supabase.from('modules').select('*').order('num', { ascending: true }),
        supabase.from('teachers').select('*'),
        supabase.from('learnings').select('*'),
        supabase.from('testimonials').select('*'),
        supabase.from('faqs').select('*'),
        supabase.from('settings').select('*').eq('id', 'global').single()
      ]);
      
      return {
        banners: banners || [],
        modules: modules || [],
        teachers: teachers || [],
        learnings: learnings || [],
        testimonials: testimonials || [],
        faqs: faqs || [],
        settings: settings || {}
      };
    } catch (error) {
      console.error('Error fetching site data:', error);
      return null;
    }
  },

  // Minicursos methods
  async getMinicursos(): Promise<Course[]> {
    try {
      // Get all courses
      const { data: courses, error: coursesError } = await supabase
        .from('minicursos')
        .select('*');
      
      if (coursesError) throw coursesError;
      
      // Get all lessons
      const { data: allLessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*');
      
      if (lessonsError) throw lessonsError;
      
      // Map lessons to their respective courses
      const coursesWithLessons = courses.map(course => {
        const courseLessons = allLessons
          .filter(lesson => lesson.course_id === course.id)
          .map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            duration: lesson.duration,
            content: lesson.content,
            mediaType: lesson.media_type,
            isSpecial: lesson.is_special,
            slideBgUrl: lesson.slide_bg_url
          }));
        
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          imageUrl: course.image_url,
          level: course.level,
          lessons: courseLessons
        } as Course;
      });
      
      return coursesWithLessons;
    } catch (error) {
      console.error('Failed to load minicursos:', error);
      return [];
    }
  },

  async updateMinicursoProgress(courseId: string, lessonId: string, progress: number) {
    try {
      const user = await this.getCurrentUser();
      if (!user?.id) throw new Error('User not authenticated');
      
      await supabase.from('user_progress').upsert({
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId,
        progress,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  },

  // Admin methods
  async createMinicurso(course: any) {
    try {
      const { data, error } = await supabase
        .from('minicursos')
        .insert({
          title: course.title,
          description: course.description,
          category: course.category || 'Dublagem',
          image_url: course.imageUrl,
          level: course.level || 'Iniciante'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        ...course
      };
    } catch (error) {
      console.error('Failed to create minicurso:', error);
      throw error;
    }
  },

  async updateMinicurso(id: string, course: any) {
    try {
      const { data, error } = await supabase
        .from('minicursos')
        .update({
          title: course.title,
          description: course.description,
          category: course.category,
          image_url: course.imageUrl,
          level: course.level
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id,
        ...course
      };
    } catch (error) {
      console.error('Failed to update minicurso:', error);
      throw error;
    }
  },

  async deleteMinicurso(id: string) {
    try {
      const { error } = await supabase
        .from('minicursos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete minicurso:', error);
      throw error;
    }
  },

  // Student data methods
  async getStudentProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      
      return data;
    } catch (error) {
      console.error('Failed to load student profile:', error);
      return null;
    }
  },

  async getStudentEnrollments(userId: string) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to load student enrollments:', error);
      return [];
    }
  },

  async getStudentActivity(userId: string) {
    try {
      const { data, error } = await supabase
        .from('student_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to load student activity:', error);
      return [];
    }
  },

  // Enrollment methods
  async createEnrollment(enrollment: any) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          name: enrollment.name,
          email: enrollment.email,
          phone: enrollment.phone,
          module: enrollment.module,
          status: 'Pendente',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        ...enrollment
      };
    } catch (error) {
      console.error('Failed to create enrollment:', error);
      throw error;
    }
  },

  // Banner methods
  async getBanners() {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to load banners:', error);
      return [];
    }
  },

  async createBanner(banner: any) {
    try {
      const { data, error } = await supabase
        .from('banners')
        .insert(banner)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        ...banner
      };
    } catch (error) {
      console.error('Failed to create banner:', error);
      throw error;
    }
  },

  async updateBanner(id: string, banner: any) {
    try {
      const { data, error } = await supabase
        .from('banners')
        .update(banner)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id,
        ...banner
      };
    } catch (error) {
      console.error('Failed to update banner:', error);
      throw error;
    }
  },

  async deleteBanner(id: string) {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete banner:', error);
      throw error;
    }
  },

  // Module methods
  async getModules() {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('num', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to load modules:', error);
      return [];
    }
  },

  async createModule(module: any) {
    try {
      const { data, error } = await supabase
        .from('modules')
        .insert(module)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        ...module
      };
    } catch (error) {
      console.error('Failed to create module:', error);
      throw error;
    }
  },

  async updateModule(id: string, module: any) {
    try {
      const { data, error } = await supabase
        .from('modules')
        .update(module)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id,
        ...module
      };
    } catch (error) {
      console.error('Failed to update module:', error);
      throw error;
    }
  },

  async deleteModule(id: string) {
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete module:', error);
      throw error;
    }
  },

  // Teacher methods
  async getTeachers() {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to load teachers:', error);
      return [];
    }
  },

  async createTeacher(teacher: any) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .insert(teacher)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        ...teacher
      };
    } catch (error) {
      console.error('Failed to create teacher:', error);
      throw error;
    }
  },

  async updateTeacher(id: string, teacher: any) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .update(teacher)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id,
        ...teacher
      };
    } catch (error) {
      console.error('Failed to update teacher:', error);
      throw error;
    }
  },

  async deleteTeacher(id: string) {
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      throw error;
    }
  },

  // Settings methods
  async getSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'global')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return data || {};
    } catch (error) {
      console.error('Failed to load settings:', error);
      return {};
    }
  },

  async updateSettings(settings: any) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert({
          id: 'global',
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },

  // UltimoHub integration methods
  async getStudioSessions(studioId: string) {
    try {
      const { data, error } = await supabase
        .from('studio_sessions')
        .select('*')
        .eq('studio_id', studioId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to load studio sessions:', error);
      return [];
    }
  },

  async getSessionTakes(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from('session_takes')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to load session takes:', error);
      return [];
    }
  },

  async saveTake(take: any) {
    try {
      const { data, error } = await supabase
        .from('session_takes')
        .insert(take)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        ...take
      };
    } catch (error) {
      console.error('Failed to save take:', error);
      throw error;
    }
  }
};

