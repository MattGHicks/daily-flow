'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  animated?: boolean;
}

export function Logo({ collapsed = false, className, animated = true }: LogoProps) {
  if (collapsed) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        {/* Minimalist DF monogram when collapsed */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Modern, clean D shape */}
            <path
              d="M8 10 L8 30 L18 30 Q28 30 28 20 Q28 10 18 10 Z"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
              fill="none"
            />
            {/* Stylish F that overlaps slightly */}
            <path
              d="M20 12 L32 12 M20 20 L30 20 M20 12 L20 32"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary/80"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Icon */}
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Clean geometric design */}
          <motion.circle
            cx="20"
            cy="20"
            r="18"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/20"
            initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Elegant DF monogram */}
          <g className="text-primary">
            {/* D */}
            <motion.path
              d="M10 12 L10 28 L16 28 Q22 28 22 20 Q22 12 16 12 Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            />
            {/* F */}
            <motion.path
              d="M24 12 L30 12 M24 18 L29 18 M24 12 L24 28"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            />
          </g>
        </svg>
      </div>

      {/* Text - Single line as requested */}
      <motion.div
        initial={animated ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col justify-center"
      >
        <h1 className="text-xl font-light tracking-wide text-foreground">
          Daily Flow
        </h1>
      </motion.div>
    </div>
  );
}