// src/components/ui/card.js
import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-lg border p-4 shadow-sm bg-white ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}