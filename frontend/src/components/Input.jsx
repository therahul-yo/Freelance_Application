import React from 'react';

const Input = ({ label, id, ...props }) => {
  return (
    <div style={{ marginBottom: '18px' }}>
      {label && (
        <label 
          htmlFor={id} 
          style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--nb-text)'
          }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className="input-field"
        {...props}
      />
    </div>
  );
};

export default Input;
