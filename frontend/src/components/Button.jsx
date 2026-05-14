import React from 'react';

/**
 * Industrial Brutalism Button
 * Variants: primary (yellow), outline, danger (red), dark (black), ghost
 * Size: sm, md, lg
 */
const Button = ({
  children,
  variant = 'primary',
  className = '',
  size = 'md',
  style = {},
  ...rest
}) => {
  const variantMap = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    danger:  'btn-danger',
    dark:    'btn-dark',
    blue:    'btn-blue',
    green:   'btn-green',
    ghost:   'btn-ghost',
  };

  const sizeMap = {
    sm: 'btn-sm',
    small: 'btn-sm',
    md: 'btn-md',
    medium: 'btn-md',
    lg: 'btn-lg',
    large: 'btn-lg',
  };

  const variantClass = variantMap[variant] || 'btn-primary';
  const sizeClass = sizeMap[size] || 'btn-md';

  const combinedClassName = `btn btn-neo ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button className={combinedClassName} style={style} {...rest}>
      {children}
    </button>
  );
};

export default Button;
