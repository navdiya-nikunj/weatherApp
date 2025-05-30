import { FC } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ 
  message, 
  details, 
  action 
}) => {
  return (
    <div className="error weather-card">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="icon" />
        <h3>{message}</h3>
      </div>
      
      {details && (
        <p className="text-sm opacity-90 mb-4">{details}</p>
      )}
      
      {action && (
        <button 
          className="retry-button"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}; 