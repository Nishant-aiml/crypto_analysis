
import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';

const ThemeToggle = () => {
  // Default to light theme (isDark = false)
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialIsDark;
    if (savedTheme) {
      initialIsDark = savedTheme === 'dark';
    } else {
      // If no saved theme, default to light theme
      // We could also respect prefers-color-scheme here if desired
      initialIsDark = false; 
    }

    setIsDark(initialIsDark);
    if (initialIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Initial sync of CSS variables is handled by index.css and tailwind.config.ts defaults
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      // For dark theme, CSS variables are applied via .dark class in index.css
    } else {
      document.documentElement.classList.remove('dark');
      // For light theme, CSS variables are applied via :root in index.css
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="glass-card p-3 rounded-lg hover:bg-secondary/30 dark:hover:bg-secondary/30 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <SunIcon className="w-5 h-5 text-yellow-400" /> // Sun icon when it's dark (to switch to light)
      ) : (
        <MoonIcon className="w-5 h-5 text-primary" /> // Moon icon when it's light (to switch to dark)
      )}
    </button>
  );
};

export default ThemeToggle;
