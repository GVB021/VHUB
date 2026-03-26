import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Plus, Trash2, Edit3, Video, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { databaseService } from '../../services/databaseService';
import { CourseGrid } from './CourseGrid';

export const AdminMinicursosTab = ({ onSave }: { onSave: any }) => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', imageUrl: '', videoUrl: '', duration: '' });
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const courses = await databaseService.getMinicursos();
      setCourses(courses);
    } catch (error) {
      toast.error('Erro ao carregar minicursos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = async () => {
    try {
      await databaseService.createMinicurso(newCourse);
      toast.success('Minicurso criado!');
      setNewCourse({ title: '', description: '', imageUrl: '', videoUrl: '', duration: '' });
      loadCourses();
    } catch (error) {
      toast.error('Erro ao criar minicurso');
    }
  };

  const handleUpdateCourse = async (course) => {
    try {
      await databaseService.updateMinicurso(course.id, course);
      toast.success('Minicurso atualizado!');
      setEditingCourse(null);
      loadCourses();
    } catch (error) {
      toast.error('Erro ao atualizar minicurso');
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      await databaseService.deleteMinicurso(id);
      toast.success('Minicurso removido!');
      loadCourses();
    } catch (error) {
      toast.error('Erro ao remover minicurso');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <Video className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Gerenciar Minicursos</h1>
          <p className="text-gray-400">Crie, edite e gerencie minicursos gratuitos</p>
        </div>
      </div>

      {/* Add New Course Form */}
      <div className="glass-panel p-8 rounded-3xl">
        <h2 className="text-2xl font-bold text-white mb-6">Novo Minicurso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            placeholder="Título do Minicurso"
            value={newCourse.title}
            onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
            className="bg-black/50 border border-white/10 rounded-xl p-4 text-white"
          />
          <input
            placeholder="Duração (ex: 45min)"
            value={newCourse.duration}
            onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
            className="bg-black/50 border border-white/10 rounded-xl p-4 text-white"
          />
          <input
            placeholder="URL Imagem (Thumbnail)"
            value={newCourse.imageUrl}
            onChange={(e) => setNewCourse({...newCourse, imageUrl: e.target.value})}
            className="bg-black/50 border border-white/10 rounded-xl p-4 text-white md:col-span-2"
          />
          <input
            placeholder="URL Vídeo (YouTube/Vimeo)"
            value={newCourse.videoUrl}
            onChange={(e) => setNewCourse({...newCourse, videoUrl: e.target.value})}
            className="bg-black/50 border border-white/10 rounded-xl p-4 text-white md:col-span-2"
          />
          <textarea
            placeholder="Descrição curta"
            value={newCourse.description}
            onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
            className="bg-black/50 border border-white/10 rounded-xl p-4 text-white h-24 md:col-span-2"
          />
        </div>
        <Button onClick={handleAddCourse} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500">
          <Plus className="w-5 h-5 mr-2" />
          Criar Minicurso
        </Button>
      </div>

      {/* Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Minicursos Ativos ({courses.length})</h2>
          <Button onClick={loadCourses} variant="outline" size="sm">
            Recarregar
          </Button>
        </div>
        <CourseGrid courses={courses} isAdmin={true} onEdit={setEditingCourse} onDelete={handleDeleteCourse} />
      </div>
    </div>
  );
};

