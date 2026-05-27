/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
        fun: ['var(--font-lilita)', 'system-ui', 'sans-serif'],
        soft: ['var(--font-fredoka)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink: {
          bg: '#FAF7F2',
          fg: '#15131C',
          mute: '#6b6677',
          line: '#15131C',
        },
        flux: {
          pink:   '#FF4FB1',
          yellow: '#FFD93D',
          blue:   '#4DA8FF',
          green:  '#5BE49B',
          lilac:  '#B197FC',
          coral:  '#FF7A59',
        },
      },
      boxShadow: {
        sticker:      '0 0 0 3px #15131C, 6px 6px 0 0 #15131C',
        'sticker-sm': '0 0 0 2px #15131C, 4px 4px 0 0 #15131C',
        'sticker-xs': '0 0 0 2px #15131C, 2px 2px 0 0 #15131C',
        outline:      '0 0 0 2px #15131C',
      },
      keyframes: {
        wiggle: {
          '0%,100%': { transform: 'rotate(-2deg)' },
          '50%':     { transform: 'rotate(2deg)' },
        },
      },
      animation: {
        wiggle: 'wiggle 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
