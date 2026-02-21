"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event?: React.MouseEvent | { x: number, y: number }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = (event?: React.MouseEvent | { x: number, y: number }) => {
    const isAppearanceTransition = document.startViewTransition !== undefined;

    if (!isAppearanceTransition) {
      setTheme(theme === 'light' ? 'dark' : 'light');
      return;
    }

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (event) {
      if ('clientX' in event) {
        x = event.clientX;
        y = event.clientY;
      } else {
        x = event.x;
        y = event.y;
      }
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      const next = theme === 'light' ? 'dark' : 'light';
      setTheme(next);
      // Manually toggle classes so the transition captures the change immediately
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(next);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`theme-container ${theme} relative min-h-screen`}>
        <div style={{
          position: 'relative',
          zIndex: 1,
          background: 'var(--background)',
          color: 'var(--foreground)'
        }}>
          {children}
        </div>

        <style jsx global>{`
          ::view-transition-old(root),
          ::view-transition-new(root) {
            animation: none;
            mix-blend-mode: normal;
          }

          /* The 'new' view is the target theme background/content */
          ::view-transition-new(root) {
            z-index: 10000;
          }

          /* The 'old' view is the current theme background/content */
          ::view-transition-old(root) {
            z-index: 1;
          }

          :root {
            --background: #ffffff;
            --foreground: #000000;
            --card: #f9f9f9;
            --border: #e2e2e2;
            --muted: #737373;
          }

          :root.dark {
            --background: #0a0a0a;
            --foreground: #ffffff;
            --card: #171717;
            --border: #262626;
            --muted: #a3a3a3;
          }

          body {
            background-color: var(--background);
            color: var(--foreground);
            transition: background-color 0s;
          }

          .glass-card {
            background: var(--card) !important;
            border-color: var(--border) !important;
            color: var(--foreground) !important;
          }
        `}</style>
      </div>
    </ThemeContext.Provider>
  );
};
