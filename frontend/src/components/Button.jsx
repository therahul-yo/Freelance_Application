import React from 'react';

const Button = ({ children, variant = 'primary', className = '', style = {}, ...props }) => {
  const baseClass = 'btn';
  const variantClass = variant === 'outline' ? 'btn-outline' : 'btn-primary';
  
  return (
    <button
      className={`${baseClass} ${variantClass} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
