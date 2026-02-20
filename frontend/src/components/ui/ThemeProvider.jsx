import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDarkMode } from '../../redux/themeSlice';

const ThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.theme);

  useEffect(() => {
    // Check for user's system preference on component mount
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Only set if we don't have a stored preference yet (initial load)
    if (typeof darkMode === 'undefined' || darkMode === null) {
      dispatch(setDarkMode(prefersDarkMode));
    }
  }, [dispatch]); // Only run on mount

  return <>{children}</>;
};

export default ThemeProvider; 