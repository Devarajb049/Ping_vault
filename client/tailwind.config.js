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
        pvPrimary: '#025259',
        pvAccent: '#0FA4AF',
        pvSecondary: '#F5F7FA',
        pvDark: '#0F172A',
        pvDarker: '#050D1A',
        pvSuccess: '#22C55E',
        pvDanger: '#EF4444',
        pvWarning: '#F59E0B',
        pvCardDark: 'rgba(15, 23, 42, 0.85)',
        pvPurple: '#A855F7',
        pvTeal: '#00F5D4',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(15, 164, 175, 0.35)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
      }
    },
  },
  plugins: [],
}
