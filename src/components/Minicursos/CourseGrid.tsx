import React from 'react';
import { Course } from '../../types/minicursos';
import { Link } from 'react-router-dom';
import { Star, Clock, Play } from 'lucide-react';
import { Button } from '../ui/button';

interface CourseGridProps {
  courses: Course[];
}

export const CourseGrid: React.FC<CourseGridProps> = ({ courses }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Link key={course.id} to={`/minicursos/${course.id}`} className="group">
          <div className="glass-panel rounded-3xl overflow-hidden h-[400px] flex flex-col hover:border-indigo-500/50 transition-all group-hover:-translate-y-2">
            <div className="h-48 relative overflow-hidden">
              <img 
                src={course.imageUrl} 
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 text-indigo-900 text-xs font-bold rounded-full backdrop-blur">
                  {course.category}
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                {course.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                {course.description}
              </p>
              <div className="flex items-center gap-4 mb-6 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>Nível {course.level}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{course.lessons.length} aulas</span>
                </div>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 group-hover:neon-glow-indigo">
                <Play className="w-4 h-4 mr-2" />
                Começar Curso
              </Button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

