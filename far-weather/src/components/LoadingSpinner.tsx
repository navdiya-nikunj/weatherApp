import { FC } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'medium' 
}) => {
  const sizeClasses: Record<'small' | 'medium' | 'large', string> = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  return (
    <div className="loading">
      <div className={`loading-spinner ${sizeClasses[size]}`} />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}; 