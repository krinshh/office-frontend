'use client';

import { useTheme } from '@/lib/themeContext';
import Moon from 'lucide-react/dist/esm/icons/moon';
import Sun from 'lucide-react/dist/esm/icons/sun';
import React from 'react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-background border border-border text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Sun className="w-5 h-5 text-warning hover:text-primary transition-colors duration-200" />
            ) : (
                <Moon className="w-5 h-5 text-primary hover:text-warning transition-colors duration-200" />
            )}
        </button>
    );
}
