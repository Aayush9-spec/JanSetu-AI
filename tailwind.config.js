/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          app: '#0b0e12',
          sidebar: '#0d1117',
          header: '#0c1015',
          panel: '#11161d',
          subtle: '#151b23',
          elevated: '#181f28',
        },
        border: {
          panel: '#242c36',
          subtle: '#1b222c',
          hover: '#303a46',
        },
        text: {
          primary: '#e6edf3',
          secondary: '#8b949e',
          muted: '#6e7681',
        },
        brand: {
          primary: '#5b9bd5',
          hover: '#4a88c7',
          accent: '#79b8ff',
          cyan: '#4faf9a',
        },
        status: {
          secure: {
            bg: 'rgba(52, 168, 83, 0.1)',
            border: 'rgba(52, 168, 83, 0.3)',
            text: '#48bb78',
          },
          suspicious: {
            bg: 'rgba(226, 152, 43, 0.1)',
            border: 'rgba(226, 152, 43, 0.3)',
            text: '#e2982b',
          },
          malicious: {
            bg: 'rgba(224, 82, 82, 0.1)',
            border: 'rgba(224, 82, 82, 0.3)',
            text: '#e05252',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
