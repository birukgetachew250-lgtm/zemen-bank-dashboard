'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Lenis smooth scrolling bound to the dashboard's scroll container,
 * synchronised with GSAP ScrollTrigger (same stack used by dashensuperapp.com).
 */
export function SmoothScroll({ wrapperId }: { wrapperId: string }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      wrapper,
      content: wrapper.firstElementChild as HTMLElement,
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    ScrollTrigger.scrollerProxy(wrapper, {
      scrollTop(value) {
        if (arguments.length) lenis.scrollTo(value as number, { immediate: true });
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: wrapper.clientWidth, height: wrapper.clientHeight };
      },
    });
    ScrollTrigger.defaults({ scroller: wrapper });
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [wrapperId]);

  return null;
}

