// src/components/ui/dialog.js
import React from 'react';

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogTitle({ children }) {
  return <h2 className="text-xl font-bold mb-2">{children}</h2>;
}

export function DialogContent({ children }) {
  return <div className="mb-4">{children}</div>;
}