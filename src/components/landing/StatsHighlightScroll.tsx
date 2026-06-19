"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import anime from "animejs";

interface StatsHighlightScrollProps {
  children: ReactNode;
  className?: string;
}

export function StatsHighlightScroll({
  children,
  className = "",
}: StatsHighlightScrollProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;

    if (!section || !stage) {
      return;
    }

    const mesh =
      stage.querySelector<HTMLElement>(
        "[data-stats-mesh]",
      );

    const glows = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-stats-glow]",
      ),
    );

    const eyebrow =
      stage.querySelector<HTMLElement>(
        "[data-stats-eyebrow]",
      );

    const eyebrowLine =
      stage.querySelector<HTMLElement>(
        "[data-stats-line]",
      );

    const heading =
      stage.querySelector<HTMLElement>(
        "[data-stats-heading]",
      );

    const statCards = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-stat-card]",
      ),
    );

    const statLabels = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-stat-label]",
      ),
    );

    const statValues = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-stat-value]",
      ),
    );

    const scorersCard =
      stage.querySelector<HTMLElement>(
        "[data-scorers-card]",
      );

    const scorersHeader =
      stage.querySelector<HTMLElement>(
        "[data-scorers-header]",
      );

    const scorerItems = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-scorer-item]",
      ),
    );

    const scorerRanks = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-scorer-rank]",
      ),
    );

    const scorerGoals = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-scorer-goals]",
      ),
    );

    const summary =
      stage.querySelector<HTMLElement>(
        "[data-stats-summary]",
      );

    if (
      !eyebrow ||
      !eyebrowLine ||
      !heading ||
      !scorersCard ||
      statCards.length === 0
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
     * Fondo de la sección.
     */
    if (mesh) {
      anime.set(mesh, {
        opacity: 0,
        scale: 1.1,
      });
    }

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
      translateY: -30,
    });

    anime.set(eyebrowLine, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    anime.set(heading, {
      opacity: 0,
      translateX: -230,
      translateY: 45,
      rotate: -2,
      scale: 0.92,
    });

    /*
     * Las tarjetas comienzan dispersas.
     */
    statCards.forEach((card, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);

      const direction =
        column === 0
          ? -1
          : column === 2
            ? 1
            : index % 2 === 0
              ? -1
              : 1;

      anime.set(card, {
        opacity: 0,
        translateX:
          direction *
          (120 + column * 20),
        translateY:
          135 + row * 38,
        rotate:
          direction *
          (4 + row * 1.5),
        scale: 0.72,
      });
    });

    /*
     * Contenido interno de las tarjetas.
     */
    anime.set(statLabels, {
      opacity: 0,
      translateY: -24,
    });

    anime.set(statValues, {
      opacity: 0,
      translateY: 50,
      rotate: -5,
      scale: 0.55,
    });

    /*
     * Panel de goleadores.
     */
    anime.set(scorersCard, {
      opacity: 0,
      translateX: 340,
      translateY: 85,
      rotate: 5,
      scale: 0.82,
    });

    if (scorersHeader) {
      anime.set(scorersHeader, {
        opacity: 0,
        translateY: -35,
      });
    }

    scorerItems.forEach((item, index) => {
      anime.set(item, {
        opacity: 0,
        translateX:
          150 + index * 25,
        translateY:
          55 + index * 12,
        rotate: 3,
        scale: 0.84,
      });
    });

    anime.set(scorerRanks, {
      opacity: 0,
      rotate: -18,
      scale: 1.8,
    });

    anime.set(scorerGoals, {
      opacity: 0,
      translateX: 40,
      scale: 0.55,
    });

    /*
     * Resumen final.
     */
    if (summary) {
      anime.set(summary, {
        opacity: 0,
        translateY: 100,
        translateX: -50,
      });
    }

    /*
     * Evita que se vean los elementos antes
     * de que Anime.js coloque sus estados.
     */
    stage.style.visibility = "visible";

    const timeline = anime.timeline({
      autoplay: false,
      easing: "linear",
    });

    /*
     * Fondo y resplandores.
     */
    if (mesh) {
      timeline.add(
        {
          targets: mesh,
          opacity: [0, 0.3],
          scale: [1.1, 1],
          duration: 1000,
          easing: "easeOutCubic",
        },
        0,
      );
    }

    if (glows.length > 0) {
      timeline.add(
        {
          targets: glows,
          opacity: [0, 1],
          scale: [0.55, 1],
          duration: 950,
          delay: anime.stagger(120),
          easing: "easeOutCubic",
        },
        0,
      );
    }

    /*
     * Temporada.
     */
    timeline.add(
      {
        targets: eyebrow,
        opacity: [0, 1],
        translateX: [-150, 0],
        translateY: [-30, 0],
        duration: 600,
        easing: "easeOutExpo",
      },
      70,
    );

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
        translateX: [-230, 0],
        translateY: [45, 0],
        rotate: [-2, 0],
        scale: [0.92, 1],
        duration: 850,
        easing: "easeOutExpo",
      },
      190,
    );

    /*
     * Las tarjetas estadísticas se acomodan.
     */
    timeline.add(
      {
        targets: statCards,
        opacity: [0, 1],
        translateX: 0,
        translateY: 0,
        rotate: 0,
        scale: [0.72, 1],
        duration: 900,
        delay: anime.stagger(70),
        easing: "easeOutExpo",
      },
      390,
    );

    /*
     * El panel de goleadores entra desde
     * el lado derecho.
     */
    timeline.add(
      {
        targets: scorersCard,
        opacity: [0, 1],
        translateX: [340, 0],
        translateY: [85, 0],
        rotate: [5, 0],
        scale: [0.82, 1],
        duration: 1050,
        easing: "easeOutExpo",
      },
      440,
    );

    /*
     * Etiquetas de las estadísticas.
     */
    if (statLabels.length > 0) {
      timeline.add(
        {
          targets: statLabels,
          opacity: [0, 1],
          translateY: [-24, 0],
          duration: 500,
          delay: anime.stagger(55),
          easing: "easeOutCubic",
        },
        630,
      );
    }

    /*
     * Valores de las estadísticas.
     */
    if (statValues.length > 0) {
      timeline.add(
        {
          targets: statValues,
          opacity: [0, 1],
          translateY: [50, 0],
          rotate: [-5, 0],
          scale: [0.55, 1],
          duration: 650,
          delay: anime.stagger(60),
          easing: "easeOutBack",
        },
        700,
      );
    }

    /*
     * Encabezado del top de goleadores.
     */
    if (scorersHeader) {
      timeline.add(
        {
          targets: scorersHeader,
          opacity: [0, 1],
          translateY: [-35, 0],
          duration: 550,
          easing: "easeOutExpo",
        },
        650,
      );
    }

    /*
     * Los goleadores aparecen uno por uno.
     */
    if (scorerItems.length > 0) {
      timeline.add(
        {
          targets: scorerItems,
          opacity: [0, 1],
          translateX: 0,
          translateY: 0,
          rotate: 0,
          scale: [0.84, 1],
          duration: 700,
          delay: anime.stagger(105),
          easing: "easeOutExpo",
        },
        750,
      );
    }

    /*
     * Posiciones del ranking.
     */
    if (scorerRanks.length > 0) {
      timeline.add(
        {
          targets: scorerRanks,
          opacity: [0, 1],
          rotate: [-18, 0],
          scale: [1.8, 1],
          duration: 600,
          delay: anime.stagger(100),
          easing: "easeOutBack",
        },
        870,
      );
    }

    /*
     * Cantidad de goles.
     */
    if (scorerGoals.length > 0) {
      timeline.add(
        {
          targets: scorerGoals,
          opacity: [0, 1],
          translateX: [40, 0],
          scale: [0.55, 1],
          duration: 550,
          delay: anime.stagger(100),
          easing: "easeOutBack",
        },
        920,
      );
    }

    /*
     * Resumen de la temporada.
     */
    if (summary) {
      timeline.add(
        {
          targets: summary,
          opacity: [0, 1],
          translateY: [100, 0],
          translateX: [-50, 0],
          duration: 800,
          easing: "easeOutExpo",
        },
        1080,
      );
    }

    let animationFrame: number | null = null;

    let animationStart = 0;
    let animationDistance = 1;

    /*
     * La animación comienza cuando la sección
     * empieza a entrar desde abajo.
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
       * El montaje termina antes de abandonar
       * la sección y deja un tramo final estable.
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
      if (animationFrame !== null) {
        return;
      }

      animationFrame =
        window.requestAnimationFrame(
          updateTimeline,
        );
    };

    const handleResize = () => {
      measureSection();
      requestTimelineUpdate();
    };

    measureSection();
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

      if (animationFrame !== null) {
        window.cancelAnimationFrame(
          animationFrame,
        );
      }

      timeline.pause();

      const cleanupTargets: HTMLElement[] = [
        ...glows,
        eyebrow,
        eyebrowLine,
        heading,
        ...statCards,
        ...statLabels,
        ...statValues,
        scorersCard,
        ...scorerItems,
        ...scorerRanks,
        ...scorerGoals,
      ];

      if (mesh) {
        cleanupTargets.push(mesh);
      }

      if (scorersHeader) {
        cleanupTargets.push(scorersHeader);
      }

      if (summary) {
        cleanupTargets.push(summary);
      }

      anime.remove(cleanupTargets);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="estadisticas-destacadas"
      className={`relative -mt-px min-h-[100svh] lg:h-[250vh] ${className}`}
    >
      <div
        ref={stageRef}
        className="relative flex min-h-[100svh] items-center overflow-hidden py-24 sm:py-28 lg:sticky lg:top-0 lg:h-[100svh] lg:min-h-0 lg:py-12"
        style={{
          visibility: "hidden",
        }}
      >
        {children}
      </div>
    </section>
  );
}

