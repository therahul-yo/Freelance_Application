import React from 'react';

const Button = ({ children, variant = 'primary', ...props }) => {
  const className = `btn-industrial ${variant === 'primary' ? 'btn-primary-industrial' : ''}`;
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};

export default Button;
