import React from 'react';
import { Video } from 'lucide-react';
import { useMinicursosStore } from '../../store/minicursosStore';
import { CourseGrid } from './CourseGrid';
import { LoadingSpinner } from '../LoadingSpinner';

export const MinicursosTab = () => {
  const { courses, isLoading } = useMinicursosStore();

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <Video className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white font-display mb-1">Minicursos Gratuitos</h1>
          <p className="text-gray-400">+100 minicursos de dublagem, fonoaudiologia e carreira</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Carregando minicursos..." />
      ) : (
        <CourseGrid courses={courses} />
      )}
    </div>
  );
};

