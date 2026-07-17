import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
 const { theme, toggleTheme } = useTheme();

 return (
 <button
 onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
 className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
 aria-label="Toggle theme"
 >
 {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
 </button>
 );
};

export default ThemeToggle;
