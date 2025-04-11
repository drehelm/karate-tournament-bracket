// src/components/ui/button.js
import React from 'react';

export function Button({ children, className = '', onClick, type = 'button', ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 font-semibold rounded-md transition hover:opacity-80 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}