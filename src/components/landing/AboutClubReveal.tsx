
"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import anime from "animejs";

interface AboutClubRevealProps {
  children: ReactNode;
  className?: string;
}

export function AboutClubReveal({
  children,
  className = "",
}: AboutClubRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const revealElements = Array.from(
      container.querySelectorAll<HTMLElement>(
        "[data-about-reveal]",
      ),
    );

    if (revealElements.length === 0) {
      return;
    }

    /*
     * Solamente se ocultan y desplazan los elementos internos.
     * La sección y su fondo permanecen en su posición normal.
     */
    anime.set(revealElements, {
      opacity: 0,
      translateY: 70,
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        anime({
          targets: revealElements,
          opacity: [0, 1],
          translateY: [70, 0],
          duration: 1100,
          delay: anime.stagger(130),
          easing: "easeOutExpo",
        });

        observer.disconnect();
      },
      {
        /*
         * La animación comienza cuando AboutClub
         * empieza a entrar después del Hero.
         */
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px",
      },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      anime.remove(revealElements);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
    >
      {children}
    </div>
  );
}
