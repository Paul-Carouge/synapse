'use client';

export const spring = { type: 'spring' as const, stiffness: 300, damping: 30, mass: 1 };
export const springSnappy = { type: 'spring' as const, stiffness: 400, damping: 25, mass: 0.8 };
export const springGentle = { type: 'spring' as const, stiffness: 200, damping: 35, mass: 1 };
export const springBouncy = { type: 'spring' as const, stiffness: 500, damping: 20, mass: 0.6 };

export const easeOut = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const };
export const easeInOut = { duration: 0.4, ease: [0.76, 0, 0.24, 1] as const };
export const easeOutQuint = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

export const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -12, opacity: 0 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { scale: 0.96, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.96, opacity: 0 },
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16, scale: 0.95, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: spring,
  },
};

export const buttonTap = { scale: 0.95 };
export const buttonHover = { scale: 1.03 };
