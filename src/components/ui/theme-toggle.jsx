import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useState, useEffect, forwardRef } from 'react';

// Simple theme toggle without next-themes dependency
export const ThemeToggle = forwardRef(({ className, ...props }, ref) => {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) {
    return null;
  }

  return (
    <Button
      {...props}
      ref={ref}
      variant="ghost"
      size="icon"
      className={className}
      onClick={toggleTheme}
    >
      {theme === 'light' ? (
        <SunIcon className="h-4 w-4 md:h-5 md:w-5" />
      ) : (
        <MoonIcon className="h-4 w-4 md:h-5 md:w-5" />
      )}
    </Button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';
