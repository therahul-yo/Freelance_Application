import React from 'react';

/**
 * Industrial Brutalism Input
 * - Label: IBM Plex Mono uppercase 11px, 700 weight
 * - Field: 4px black border, 0 radius, 6px 6px 0 shadow
 * - Focus: blue border, no shadow
 */
const Input = ({ label, id, type = 'text', as, style, ...props }) => {
  const isTextarea = type === 'textarea' || as === 'textarea';

  return (
    <div style={{ marginBottom: 20, ...style }}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}

      {isTextarea ? (
        <textarea id={id} className="input-field" {...props} />
      ) : (
        <input id={id} type={type} className="input-field" {...props} />
      )}
    </div>
  );
};

export default Input;
