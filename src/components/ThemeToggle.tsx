
import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
    
    // Update CSS custom properties for light theme
    if (!newTheme) {
      document.documentElement.style.setProperty('--background', '#FAFAF8');
      document.documentElement.style.setProperty('--foreground', '#141413');
    } else {
      document.documentElement.style.setProperty('--background', '#141413');
      document.documentElement.style.setProperty('--foreground', '#FAFAF8');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="glass-card p-3 rounded-lg hover:bg-secondary/30 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <SunIcon className="w-5 h-5 text-yellow-400" />
      ) : (
        <MoonIcon className="w-5 h-5 text-blue-400" />
      )}
    </button>
  );
};

export default ThemeToggle;
