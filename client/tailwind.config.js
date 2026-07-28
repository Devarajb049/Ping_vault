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
        pvPrimary: '#2563EB',
        pvSecondary: '#3B82F6',
        pvAccent: '#3B82F6',
        pvSuccess: '#10B981',
        pvWarning: '#F59E0B',
        pvDanger: '#EF4444',
        pvBg: '#0B1120',
        pvDarker: '#0B1120',
        pvDark: '#111827',
        pvSurface: '#111827',
        pvCardDark: 'rgba(255, 255, 255, 0.05)',
        pvPurple: '#8B5CF6',
        pvCyan: '#06B6D4',
        pvTeal: '#14B8A6',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px rgba(37, 99, 235, 0.35)',
        'glow-accent': '0 0 25px rgba(59, 130, 246, 0.35)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-purple': '0 0 25px rgba(139, 92, 246, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'neumorphism': '8px 8px 16px #070b15, -8px -8px 16px #0f172b',
        'neumorphism-inset': 'inset 4px 4px 8px #070b15, inset -4px -4px 8px #0f172b',
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
