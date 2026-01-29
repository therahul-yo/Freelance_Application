import React from 'react';

const Input = ({ label, id, ...props }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label htmlFor={id} style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>{label}</label>}
      <input
        id={id}
        className="input-field"
        {...props}
      />
    </div>
  );
};

export default Input;
