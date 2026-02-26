import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function SimpleThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();

  const handleToggle = () => {
    console.log('Current theme:', theme);
    console.log('Is dark:', isDark);
    
    if (isDark) {
      setTheme('light');
      console.log('Setting to light mode');
    } else {
      setTheme('dark');
      console.log('Setting to dark mode');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      title="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-yellow-500" />
      ) : (
        <Moon className="w-4 h-4 text-gray-700" />
      )}
    </button>
  );
}
