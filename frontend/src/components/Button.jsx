import React from 'react';

const Button = ({ children, variant = 'primary', className = '', size = '', style = {}, ...rest }) => {
  const variantMap = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    danger: 'btn-danger',
    blue: 'btn-blue',
    green: 'btn-green',
  };

  const sizeStyles = size === 'small' ? { padding: '8px 16px', fontSize: '12px' } : {};
  
  const variantClass = variantMap[variant] || 'btn-primary';
  const combinedClassName = `btn-neo ${variantClass} ${className}`.trim();
  
  return (
    <button className={combinedClassName} style={{ ...sizeStyles, ...style }} {...rest}>
      {children}
    </button>
  );
};

export default Button;
