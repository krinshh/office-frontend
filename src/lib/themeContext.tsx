'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from './settingsContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { settings } = useSettings();
    const [theme, setTheme] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        }
        setMounted(true);
    }, []);

    const applyThemeToDOM = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');

        // CSS Variable overrides for premium look
        const root = document.documentElement;
        if (newTheme === 'dark') {
            root.style.setProperty('--bg-primary', '#0f172a');
            root.style.setProperty('--bg-secondary', '#1e293b');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#94a3b8');
        } else {
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f8fafc');
            root.style.setProperty('--text-primary', '#1e293b');
            root.style.setProperty('--text-secondary', '#64748b');
        }
    };

    // Listen for manual sync events (from Settings Page or Initial Load)
    useEffect(() => {
        const handleSync = (e: any) => {
            const newTheme = e.detail as Theme;
            console.log('THEME: Syncing to UI', newTheme);
            applyThemeToDOM(newTheme);
        };

        window.addEventListener('app:theme-sync', handleSync);
        return () => window.removeEventListener('app:theme-sync', handleSync);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        applyThemeToDOM(newTheme);
    };

    // We allow children to render during SSR to prevent LCP blackout.
    // The theme will be correctly synchronized once mounted on the client.

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
