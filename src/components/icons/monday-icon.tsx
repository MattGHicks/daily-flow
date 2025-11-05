import React from 'react';

interface MondayIconProps {
  className?: string;
}

export function MondayIcon({ className = 'h-4 w-4' }: MondayIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5.5 3C4.119 3 3 4.119 3 5.5v13C3 19.881 4.119 21 5.5 21h13c1.381 0 2.5-1.119 2.5-2.5v-13C21 4.119 19.881 3 18.5 3h-13zm2 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4.5 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4.5 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM7.5 11a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4.5 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4.5 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM7.5 16a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4.5 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4.5 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
    </svg>
  );
}
