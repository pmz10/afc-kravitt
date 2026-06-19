"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import anime from "animejs";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
}

export function SectionReveal({
  children,
  className = "",
}: SectionRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    /*
     * Estado inicial.
     *
     * La sección se encuentra debajo del Hero,
     * pero comienza desplazada y transparente.
     */
    anime.set(container, {
      opacity: 0,
      translateY: 90,
      scale: 0.985,
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        anime({
          targets: container,
          opacity: [0, 1],
          translateY: [90, 0],
          scale: [0.985, 1],
          duration: 1200,
          easing: "easeOutExpo",
        });

        /*
         * La animación se ejecuta una sola vez.
         */
        observer.disconnect();
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      anime.remove(container);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative will-change-[transform,opacity] ${className}`}
      style={{
        opacity: 0,
        transform: "translateY(90px) scale(0.985)",
      }}
    >
      {children}
    </div>
  );
}
