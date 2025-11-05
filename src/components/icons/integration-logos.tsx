import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const MondayLogo: React.FC<LogoProps> = ({ className, size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="40" height="40" rx="8" fill="#FF3D57" />
    <circle cx="10" cy="22" r="4" fill="white" />
    <circle cx="20" cy="14" r="4" fill="white" />
    <circle cx="30" cy="18" r="4" fill="white" />
    <path
      d="M10 22V30C10 31.1046 10.8954 32 12 32C13.1046 32 14 31.1046 14 30V22"
      fill="white"
    />
    <path
      d="M20 14V30C20 31.1046 20.8954 32 22 32C23.1046 32 24 31.1046 24 30V14"
      fill="white"
    />
    <path
      d="M30 18V30C30 31.1046 30.8954 32 32 32C33.1046 32 34 31.1046 34 30V18"
      fill="white"
    />
  </svg>
);

export const RedmineLogo: React.FC<LogoProps> = ({ className, size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="40" height="40" rx="8" fill="#B32024" />
    <path
      d="M20 8C18 8 16.5 9.5 16.5 11.5V13.5C16.5 15.5 18 17 20 17C22 17 23.5 15.5 23.5 13.5V11.5C23.5 9.5 22 8 20 8Z"
      fill="white"
    />
    <ellipse cx="20" cy="20" rx="8" ry="9" fill="white" />
    <path
      d="M13 27C13 27 14 31 20 31C26 31 27 27 27 27"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="17" cy="19" r="1.5" fill="#B32024" />
    <circle cx="23" cy="19" r="1.5" fill="#B32024" />
  </svg>
);

export const GoogleCalendarLogo: React.FC<LogoProps> = ({ className, size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="40" height="40" rx="8" fill="white" />
    <rect x="6" y="8" width="28" height="26" rx="2" fill="#4285F4" />
    <rect x="6" y="8" width="28" height="8" rx="2" fill="#1967D2" />
    <path
      d="M12 6V10M28 6V10"
      stroke="#4285F4"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <text
      x="20"
      y="27"
      fontSize="12"
      fontWeight="bold"
      fill="white"
      textAnchor="middle"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      31
    </text>
  </svg>
);

export const SpotifyLogo: React.FC<LogoProps> = ({ className, size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="40" height="40" rx="20" fill="#1DB954" />
    <path
      d="M28 15C23 12 13 12 9 14"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M27 20C22.5 17.5 15 17.5 10.5 19.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M25.5 25C21.5 22.8 16 23 12 24.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
