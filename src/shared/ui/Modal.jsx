import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = ''
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      default: return 'max-w-lg';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 animate-scale-up ${getSizeClass()} ${className}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
