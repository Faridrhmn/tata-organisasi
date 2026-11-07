/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gitlab: {
          bg: '#f6f6f7',
          sidebar: '#f0f0f2',
          sidebarHover: '#e8e8eb',
          sidebarActive: '#dedee2',
          border: '#e1e1e4',
          panelBorder: '#e5e5e7',
          text: '#1f1f23',
          secondary: '#626168',
          muted: '#8c8b94',
          blue: '#1068eb',
          purple: '#6e49cb',
        },
        tari: {
          green: '#16a34a',
          emerald: '#10b981',
          navy: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        gitlab: '0 1px 2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
