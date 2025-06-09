import React from 'react';

interface ErrorMessageProps {
  message: string;
  className?: string;
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  className = '',
  variant = 'error'
}) => {
  const variantStyles = {
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700'
  };

  return (
    <div 
      className={`p-3 border rounded ${variantStyles[variant]} ${className}`}
      role="alert"
    >
      {message}
    </div>
  );
};