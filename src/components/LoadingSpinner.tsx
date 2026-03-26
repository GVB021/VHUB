import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Carregando...',
  size = 'md',
  fullScreen = false
}) => {
  const sizeClass = size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12';

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${fullScreen ? 'min-h-screen p-8' : 'p-6'}`}>
      <div className={`border-4 border-primary/20 border-t-primary rounded-full animate-spin ${sizeClass}`}>
        <Loader2 className={`w-full h-full ${sizeClass}`} />
      </div>
      {message && (
        <p className="text-muted-foreground font-medium tracking-wider uppercase text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

