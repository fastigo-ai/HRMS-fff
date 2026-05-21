import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useUiStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
      aria-label="Toggle light and dark modes"
      id="theme-toggle-btn"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5 text-amber-400" />
      )}
    </button>
  );
}
