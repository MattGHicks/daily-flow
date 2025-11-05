import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Monday.com status colors - safelist for dynamic class generation
    'bg-blue-100', 'text-blue-800', 'border-blue-300',
    'dark:bg-blue-900/30', 'dark:text-blue-400', 'dark:border-blue-700',
    'bg-orange-100', 'text-orange-800', 'border-orange-300',
    'dark:bg-orange-900/30', 'dark:text-orange-400', 'dark:border-orange-700',
    'bg-gray-100', 'text-gray-800', 'border-gray-300',
    'dark:bg-gray-800', 'dark:text-gray-200', 'dark:border-gray-600',
    'bg-green-100', 'text-green-800', 'border-green-300',
    'dark:bg-green-900/30', 'dark:text-green-400', 'dark:border-green-700',
    'bg-red-100', 'text-red-800', 'border-red-300',
    'dark:bg-red-900/30', 'dark:text-red-400', 'dark:border-red-700',
    'bg-pink-100', 'text-pink-800', 'border-pink-300',
    'dark:bg-pink-900/30', 'dark:text-pink-400', 'dark:border-pink-700',
    'bg-purple-100', 'text-purple-800', 'border-purple-300',
    'dark:bg-purple-900/30', 'dark:text-purple-400', 'dark:border-purple-700',
    'bg-yellow-100', 'text-yellow-800', 'border-yellow-300',
    'dark:bg-yellow-900/30', 'dark:text-yellow-400', 'dark:border-yellow-700',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};

export default config;
