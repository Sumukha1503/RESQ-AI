/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ResQ Brand Colors
        resq: {
          blue: '#63b3ed',
          mint: '#68d391',
          orange: '#f97316',
          success: '#22c55e',
          dark: '#0b0f19',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'counter': 'counterPulse 0.3s ease-out',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'bike': 'bike-ride 8s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        counterPulse: {
          '0%': { transform: 'scale(1.2)', color: '#63b3ed' },
          '100%': { transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,179,237,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(99,179,237,0.5)' },
        },
      },
      backgroundImage: {
        'gradient-resq': 'linear-gradient(135deg, #63b3ed, #68d391)',
        'gradient-hero': 'linear-gradient(135deg, #f0f9ff 0%, #f4f6f8 40%, #f0fdf4 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0b0f19 0%, #0f172a 50%, #0b1a12 100%)',
        'gradient-premium': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '64px',
      },
      boxShadow: {
        'clay': '6px 6px 20px rgba(99,179,237,0.12), -4px -4px 16px rgba(255,255,255,0.9)',
        'clay-hover': '8px 12px 28px rgba(99,179,237,0.18), -4px -4px 16px rgba(255,255,255,0.95)',
        'glass': '0 8px 32px rgba(99,179,237,0.08), 0 0 0 1px rgba(255,255,255,0.05)',
        'glow-blue': '0 0 30px rgba(99,179,237,0.4)',
        'glow-mint': '0 0 30px rgba(104,211,145,0.4)',
        'glow-orange': '0 0 30px rgba(249,115,22,0.4)',
      },
    },
  },
  plugins: [],
};
