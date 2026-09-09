/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        bg: '#ffffff',
        'bg-muted': '#f8fafc',
        border: '#e5e7eb',
        text: '#111827',
        'text-muted': '#4b5563',
        'text-subtle': '#6b7280',
        primary: '#1b5bbe',
        'primary-hover': '#174ea6',
        'primary-soft': '#eaf2ff',
        field: '#cbd5e1',
        /* chat-specific */
        'bubble-user': '#1b5bbe',
        'bubble-bot': '#f1f5f9',
      },
      fontFamily: {
        base: ['"Noto Sans Hebrew"', '"Assistant"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
      boxShadow: {
        window: '0 12px 40px -8px rgba(15, 23, 42, 0.25)',
        bubble: '0 8px 24px -6px rgba(27, 91, 190, 0.45)',
      },
      keyframes: {
        'dot-bounce': {
          '0%, 80%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '40%': { transform: 'translateY(-4px)', opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'dot-bounce': 'dot-bounce 1.4s infinite ease-in-out both',
        'fade-in-up': 'fade-in-up 0.25s ease-out both',
      },
    },
  },
  plugins: [],
};
