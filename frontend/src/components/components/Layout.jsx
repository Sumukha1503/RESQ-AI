import React from 'react';
import { Navbar } from './Navbar';
import { Toaster } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';

export function Layout({ children }) {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0b0f19] text-white' : 'bg-[#f4f6f8] text-gray-900'}`}>
      <Navbar />
      <main>
        {children}
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'Poppins, sans-serif',
            borderRadius: '1rem',
            background: isDark ? '#141828' : '#fff',
            color: isDark ? '#fff' : '#111',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
          },
        }}
        richColors
      />
    </div>
  );
}