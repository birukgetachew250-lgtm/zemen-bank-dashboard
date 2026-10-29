'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Wraps a page: every element with `[data-reveal]` rises in with a staggered
 * GSAP ScrollTrigger animation; `.card-3d` elements get a pointer-follow tilt.
 * Re-runs on every route change because it lives in template.tsx.
 */
export function GsapReveal({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]');
      if (targets.length === 0) {
        // Fallback: auto-reveal direct children of the page
        const kids = Array.from(root.current?.firstElementChild?.children ?? []) as HTMLElement[];
        gsap.from(kids, { y: 28, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, clearProps: 'all' });
      } else {
        ScrollTrigger.batch(targets, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { y: 36, opacity: 0, scale: 0.98 },
              { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out', stagger: 0.1, clearProps: 'transform,opacity' },
            ),
        });
      }

      // Pointer-follow 3D tilt (Revolut / Apple Card feel)
      gsap.utils.toArray<HTMLElement>('.card-3d').forEach((el) => {
        const rx = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3' });
        const ry = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3' });
        gsap.set(el, { transformPerspective: 900 });
        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 8);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
        });
        el.addEventListener('pointerleave', () => { rx(0); ry(0); });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return <div ref={root}>{children}</div>;
}

