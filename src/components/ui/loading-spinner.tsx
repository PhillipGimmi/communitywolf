import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: Readonly<LoadingSpinnerProps>) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div 
      data-testid="loading-spinner"
      className={cn('flex flex-col items-center justify-center space-y-2', className)}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-gray-900',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-gray-700 font-medium">{text}</p>
      )}
    </div>
  );
}

export function ButtonLoadingSpinner({ size = 'sm' }: Readonly<{ size?: 'sm' | 'md' | 'lg' }>) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-white border-t-transparent',
        sizeClasses[size]
      )}
    />
  );
}

export function FullPageLoadingSpinner({ text = 'Loading...' }: Readonly<{ text?: string }>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}
