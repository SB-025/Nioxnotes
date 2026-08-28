import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  loading = false, 
  disabled = false, 
  icon: Icon,
  className = '',
  ...props 
}) => {
  const baseClass = 'ui-button';
  const variantClass = `ui-button--${variant}`;
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${className}`} 
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {!loading && Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default Button;
