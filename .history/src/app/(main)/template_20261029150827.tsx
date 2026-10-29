'use client';

import { motion } from 'framer-motion';
import { GsapReveal } from '@/components/motion/GsapReveal';

/** Page transition (Framer Motion) + scroll-reveal choreography (GSAP) for every page in (main). */
export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <GsapReveal>{children}</GsapReveal>
    </motion.div>
  );
}
