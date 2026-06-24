
"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import anime from "animejs";

interface PlantelDestacadoScrollProps {
  children: ReactNode;
  className?: string;
}

export function PlantelDestacadoScroll({
  children,
  className = "",
}: PlantelDestacadoScrollProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;

    if (!section || !stage) {
      return;
    }

    const glows = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-squad-glow]",
      ),
    );

    const eyebrow =
      stage.querySelector<HTMLElement>(
        "[data-squad-eyebrow]",
      );

    const eyebrowLine =
      stage.querySelector<HTMLElement>(
        "[data-squad-line]",
      );

    const heading =
      stage.querySelector<HTMLElement>(
        "[data-squad-heading]",
      );

    const viewAllLink =
      stage.querySelector<HTMLElement>(
        "[data-squad-link]",
      );

    const cards = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-player-card]",
      ),
    );

    const numbers = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-player-number]",
      ),
    );

    const tags = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-player-tags]",
      ),
    );

    const names = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-player-name]",
      ),
    );

    const stats = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-player-stats]",
      ),
    );

    if (
      !eyebrow ||
      !eyebrowLine ||
      !heading ||
      !viewAllLink ||
      cards.length === 0
    ) {
      stage.style.visibility = "visible";
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotion.matches) {
      stage.style.visibility = "visible";
      return;
    }

    /*
     * Estado inicial de las luces.
     */
    anime.set(glows, {
      opacity: 0,
      scale: 0.55,
    });

    /*
     * Encabezado.
     */
    anime.set(eyebrow, {
      opacity: 0,
      translateX: -150,
      translateY: -35,
    });

    anime.set(eyebrowLine, {
      opacity: 0,
      scaleX: 0,
    });

    anime.set(heading, {
      opacity: 0,
      translateX: -210,
      translateY: 45,
      rotate: -2,
      scale: 0.92,
    });

    anime.set(viewAllLink, {
      opacity: 0,
      translateX: 180,
      translateY: 40,
    });

    /*
     * Las tarjetas comienzan dispersas.
     */
    cards.forEach((card, index) => {
      const column = index % 4;
      const row = Math.floor(index / 4);

      const horizontalDirection =
        column < 2 ? -1 : 1;

      const translateX =
        horizontalDirection *
        (150 + Math.abs(column - 1.5) * 45);

      const translateY =
        160 + row * 85 + (index % 2) * 30;

      const rotation =
        horizontalDirection *
        (5 + (index % 3) * 2);

      anime.set(card, {
        opacity: 0,
        translateX,
        translateY,
        rotate: rotation,
        scale: 0.74,
      });
    });

    /*
     * Elementos internos de cada tarjeta.
     */
    anime.set(numbers, {
      opacity: 0,
      rotate: 16,
      scale: 1.7,
    });

    anime.set(tags, {
      opacity: 0,
      translateY: -35,
      scale: 0.8,
    });

    anime.set(names, {
      opacity: 0,
      translateY: 55,
    });

    anime.set(stats, {
      opacity: 0,
      translateY: 35,
    });

    /*
     * Se muestra el escenario cuando Anime.js
     * ya estableció todas las posiciones iniciales.
     */
    stage.style.visibility = "visible";

    const timeline = anime.timeline({
      autoplay: false,
      easing: "linear",
    });

    /*
     * Resplandores ambientales.
     */
    if (glows.length > 0) {
      timeline.add(
        {
          targets: glows,
          opacity: [0, 1],
          scale: [0.55, 1],
          duration: 900,
          delay: anime.stagger(120),
          easing: "easeOutCubic",
        },
        0,
      );
    }

    /*
     * Etiqueta "El plantel".
     */
    timeline.add(
      {
        targets: eyebrow,
        opacity: [0, 1],
        translateX: [-150, 0],
        translateY: [-35, 0],
        duration: 600,
        easing: "easeOutExpo",
      },
      60,
    );

    /*
     * Línea naranja.
     */
    timeline.add(
      {
        targets: eyebrowLine,
        opacity: [0, 1],
        scaleX: [0, 1],
        duration: 500,
        easing: "easeOutExpo",
      },
      150,
    );

    /*
     * Título principal.
     */
    timeline.add(
      {
        targets: heading,
        opacity: [0, 1],
        translateX: [-210, 0],
        translateY: [45, 0],
        rotate: [-2, 0],
        scale: [0.92, 1],
        duration: 850,
        easing: "easeOutExpo",
      },
      190,
    );

    /*
     * Enlace para ver el plantel completo.
     */
    timeline.add(
      {
        targets: viewAllLink,
        opacity: [0, 1],
        translateX: [180, 0],
        translateY: [40, 0],
        duration: 700,
        easing: "easeOutExpo",
      },
      320,
    );

    /*
     * Las tarjetas se acomodan una por una.
     *
     * Como cada tarjeta tiene una posición inicial
     * distinta, todas llegan desde diferentes puntos.
     */
    timeline.add(
      {
        targets: cards,
        opacity: [0, 1],
        translateX: 0,
        translateY: 0,
        rotate: 0,
        scale: [0.74, 1],
        duration: 900,
        delay: anime.stagger(85),
        easing: "easeOutExpo",
      },
      430,
    );

    /*
     * Los dorsales grandes aparecen detrás.
     */
    if (numbers.length > 0) {
      timeline.add(
        {
          targets: numbers,
          opacity: [0, 1],
          rotate: [16, 0],
          scale: [1.7, 1],
          duration: 650,
          delay: anime.stagger(70),
          easing: "easeOutBack",
        },
        630,
      );
    }

    /*
     * Posición y etiqueta de capitán.
     */
    if (tags.length > 0) {
      timeline.add(
        {
          targets: tags,
          opacity: [0, 1],
          translateY: [-35, 0],
          scale: [0.8, 1],
          duration: 550,
          delay: anime.stagger(65),
          easing: "easeOutExpo",
        },
        710,
      );
    }

    /*
     * Nombres de jugadores.
     */
    if (names.length > 0) {
      timeline.add(
        {
          targets: names,
          opacity: [0, 1],
          translateY: [55, 0],
          duration: 650,
          delay: anime.stagger(65),
          easing: "easeOutExpo",
        },
        790,
      );
    }

    /*
     * Estadísticas inferiores.
     */
    if (stats.length > 0) {
      timeline.add(
        {
          targets: stats,
          opacity: [0, 1],
          translateY: [35, 0],
          duration: 550,
          delay: anime.stagger(55),
          easing: "easeOutExpo",
        },
        900,
      );
    }

    let animationFrame: number | null = null;
    let isNear = false;

    let animationStart = 0;
    let animationDistance = 1;

    /*
     * Empieza a construir la sección cuando
     * comienza a entrar desde abajo.
     */
    const measureSection = () => {
      const absoluteTop =
        section.getBoundingClientRect().top +
        window.scrollY;

      const animationEnd =
        absoluteTop +
        section.offsetHeight -
        window.innerHeight;

      animationStart =
        absoluteTop -
        window.innerHeight * 0.78;

      animationDistance = Math.max(
        1,
        animationEnd - animationStart,
      );
    };

    const updateTimeline = () => {
      animationFrame = null;

      const rawProgress =
        (window.scrollY - animationStart) /
        animationDistance;

      const sectionProgress = Math.min(
        1,
        Math.max(0, rawProgress),
      );

      /*
       * Termina el montaje antes de abandonar
       * completamente la sección.
       */
      const assemblyProgress = Math.min(
        1,
        sectionProgress / 0.88,
      );

      timeline.seek(
        timeline.duration * assemblyProgress,
      );
    };

    const requestTimelineUpdate = () => {
      if (!isNear) {
        return;
      }

      if (animationFrame !== null) {
        return;
      }

      animationFrame =
        window.requestAnimationFrame(
          updateTimeline,
        );
    };

    /*
     * Observer de proximidad: el scroll listener corre, pero la
     * callback retorna early si la sección no está cerca del viewport.
     */
    const proximityObserver = new IntersectionObserver(
      ([entry]) => {
        isNear = entry.isIntersecting;
        if (isNear) {
          requestTimelineUpdate();
        }
      },
      {
        rootMargin: "150% 0px 150% 0px",
      },
    );
    proximityObserver.observe(section);

    const handleResize = () => {
      measureSection();
      requestTimelineUpdate();
    };

    measureSection();
    isNear = true;
    updateTimeline();

    window.addEventListener(
      "scroll",
      requestTimelineUpdate,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      window.removeEventListener(
        "scroll",
        requestTimelineUpdate,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );

      proximityObserver.disconnect();

      if (animationFrame !== null) {
        window.cancelAnimationFrame(
          animationFrame,
        );
      }

      timeline.pause();

      const cleanupTargets = [
        ...glows,
        eyebrow,
        eyebrowLine,
        heading,
        viewAllLink,
        ...cards,
        ...numbers,
        ...tags,
        ...names,
        ...stats,
      ];

      anime.remove(cleanupTargets);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="plantel-destacado"
      className={`relative -mt-px h-[190vh] sm:h-[170vh] ${className}`}
    >
      <div
        ref={stageRef}
        className="sticky top-0 flex h-[100svh] items-center overflow-hidden py-4 sm:py-10 lg:py-16"
        style={{
          visibility: "hidden",
        }}
      >
        {children}
      </div>
    </section>
  );
}

