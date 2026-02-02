import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core backgrounds
        'bg-void': '#030308',
        'bg-primary': '#0a0a12',
        'bg-secondary': 'rgba(20, 20, 35, 0.6)',
        'bg-tertiary': 'rgba(30, 30, 50, 0.4)',
        'bg-card': 'rgba(15, 15, 25, 0.8)',
        
        // OpenClaw red palette
        'claw-red': '#FF4444',
        'claw-red-bright': '#FF5555',
        'claw-red-muted': 'rgba(255, 68, 68, 0.15)',
        'claw-red-glow': 'rgba(255, 68, 68, 0.5)',
        
        // Borders
        'border-subtle': 'rgba(255, 255, 255, 0.06)',
        'border-default': 'rgba(255, 255, 255, 0.1)',
        'border-prominent': 'rgba(255, 255, 255, 0.15)',
        
        // Text
        'text-primary': '#FAFAFA',
        'text-secondary': 'rgba(255, 255, 255, 0.7)',
        'text-muted': 'rgba(255, 255, 255, 0.5)',
        'text-faint': 'rgba(255, 255, 255, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'monospace'],
        display: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        'tighter': '-0.03em',
        'tight': '-0.02em',
        'wide': '0.1em',
        'wider': '0.15em',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 68, 68, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 68, 68, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-red': '0 0 60px rgba(255, 68, 68, 0.4)',
        'glow-red-sm': '0 0 30px rgba(255, 68, 68, 0.3)',
        'glow-red-lg': '0 0 100px rgba(255, 68, 68, 0.5)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'card': '0 4px 40px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 68, 68, 0.3), transparent)',
        'card-gradient': 'linear-gradient(135deg, rgba(255, 68, 68, 0.1), transparent 50%, rgba(255, 68, 68, 0.05))',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};
export default config;
