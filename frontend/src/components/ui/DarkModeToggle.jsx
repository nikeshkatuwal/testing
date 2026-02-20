import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Moon, Sun } from 'lucide-react';
import { toggleDarkMode } from '../../redux/themeSlice';
import { Button } from './button';

const DarkModeToggle = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.theme);

  const handleToggle = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label="Toggle dark mode"
      className={`rounded-full p-2 transition-all duration-300 hover:scale-110 ${darkMode
          ? 'bg-slate-700 hover:bg-slate-600 text-yellow-300 border border-slate-600'
          : 'bg-amber-100 hover:bg-amber-200 text-slate-800 border border-amber-200'
        }`}
      style={{
        boxShadow: darkMode ? '0 0 10px rgba(255, 255, 255, 0.1)' : '0 0 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      {darkMode ? (
        <Sun className="h-5 w-5 transition-transform hover:rotate-90 duration-500" />
      ) : (
        <Moon className="h-5 w-5 transition-transform hover:-rotate-12 duration-300" />
      )}
      <span className="sr-only">{darkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
    </Button>
  );
};

export default DarkModeToggle; 