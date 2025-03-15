import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };
  
  const colorClasses = {
    primary: 'border-primary-500',
    gray: 'border-gray-500',
    white: 'border-white'
  };
  
  return (
    <div className={`animate-spin ${sizeClasses[size]} border-4 ${colorClasses[color]} rounded-full border-t-transparent`}></div>
  );
};

export default LoadingSpinner;
