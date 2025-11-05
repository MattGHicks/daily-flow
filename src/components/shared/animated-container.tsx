'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { fadeIn, slideUp, springTransition } from '@/lib/animations';

interface AnimatedContainerProps extends HTMLMotionProps<'div'> {
  animation?: 'fadeIn' | 'slideUp' | 'none';
  delay?: number;
}

const animations = {
  fadeIn,
  slideUp,
  none: {},
};

export function AnimatedContainer({
  children,
  animation = 'fadeIn',
  delay = 0,
  ...props
}: AnimatedContainerProps) {
  return (
    <motion.div
      variants={animations[animation]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ ...springTransition, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
