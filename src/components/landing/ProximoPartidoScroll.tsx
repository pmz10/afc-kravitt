
"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import anime from "animejs";

interface ProximoPartidoScrollProps {
  children: ReactNode;
  className?: string;
}

export function ProximoPartidoScroll({
  children,
  className = "",
}: ProximoPartidoScrollProps) {
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
        "[data-match-glow]",
      ),
    );

    const eyebrow =
      stage.querySelector<HTMLElement>(
        "[data-match-eyebrow]",
      );

    const eyebrowLines = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-match-eyebrow-line]",
      ),
    );

    const heading =
      stage.querySelector<HTMLElement>(
        "[data-match-heading]",
      );

    const matchCard =
      stage.querySelector<HTMLElement>(
        "[data-match-card]",
      );

    const matchHeader =
      stage.querySelector<HTMLElement>(
        "[data-match-header]",
      );

    const localTeam =
      stage.querySelector<HTMLElement>(
        "[data-match-local]",
      );

    const versus =
      stage.querySelector<HTMLElement>(
        "[data-match-versus]",
      );

    const rivalTeam =
      stage.querySelector<HTMLElement>(
        "[data-match-rival]",
      );

    const matchDetails =
      stage.querySelector<HTMLElement>(
        "[data-match-details]",
      );

    const emptyState =
      stage.querySelector<HTMLElement>(
        "[data-match-empty]",
      );

    const resultsCard =
      stage.querySelector<HTMLElement>(
        "[data-results-card]",
      );

    const resultsHeader =
      stage.querySelector<HTMLElement>(
        "[data-results-header]",
      );

    const resultItems = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-result-item]",
      ),
    );

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotion.matches) {
      stage.style.visibility = "visible";
      return;
    }

    /*
     * Estado inicial del fondo.
     */
    anime.set(glows, {
      opacity: 0,
      scale: 0.55,
    });

    /*
     * Encabezado de la sección.
     */
    if (eyebrow) {
      anime.set(eyebrow, {
        opacity: 0,
        translateY: -70,
        scale: 0.9,
      });
    }

    anime.set(eyebrowLines, {
      scaleX: 0,
      opacity: 0,
    });

    if (heading) {
      anime.set(heading, {
        opacity: 0,
        translateY: -85,
        scale: 0.9,
        letterSpacing: "0.08em",
      });
    }

    /*
     * Tarjeta del próximo partido.
     */
    if (matchCard) {
      anime.set(matchCard, {
        opacity: 0,
        translateX: -330,
        translateY: 85,
        rotate: -5,
        scale: 0.84,
      });
    }

    if (matchHeader) {
      anime.set(matchHeader, {
        opacity: 0,
        translateY: -35,
      });
    }

    if (localTeam) {
      anime.set(localTeam, {
        opacity: 0,
        translateX: -170,
        translateY: 55,
        rotate: -8,
        scale: 0.72,
      });
    }

    if (versus) {
      anime.set(versus, {
        opacity: 0,
        translateY: 90,
        rotate: -12,
        scale: 0.4,
      });
    }

    if (rivalTeam) {
      anime.set(rivalTeam, {
        opacity: 0,
        translateX: 170,
        translateY: 55,
        rotate: 8,
        scale: 0.72,
      });
    }

    if (matchDetails) {
      anime.set(matchDetails, {
        opacity: 0,
        translateY: 110,
        scale: 0.92,
      });
    }

    if (emptyState) {
      anime.set(emptyState, {
        opacity: 0,
        translateY: 100,
        scale: 0.9,
      });
    }

    /*
     * Tarjeta de últimos resultados.
     */
    if (resultsCard) {
      anime.set(resultsCard, {
        opacity: 0,
        translateX: 330,
        translateY: 85,
        rotate: 5,
        scale: 0.84,
      });
    }

    if (resultsHeader) {
      anime.set(resultsHeader, {
        opacity: 0,
        translateY: -35,
      });
    }

    resultItems.forEach((item, index) => {
      anime.set(item, {
        opacity: 0,
        translateX: 100 + index * 18,
        translateY: 45,
        rotate: 3,
        scale: 0.88,
      });
    });

    /*
     * Se muestra el escenario después de colocar
     * todos los elementos en su posición inicial.
     */
    stage.style.visibility = "visible";

    const timeline = anime.timeline({
      autoplay: false,
      easing: "linear",
    });

    /*
     * Fondos ambientales.
     */
    if (glows.length > 0) {
      timeline.add(
        {
          targets: glows,
          opacity: [0, 1],
          scale: [0.55, 1],
          duration: 900,
          delay: anime.stagger(100),
          easing: "easeOutCubic",
        },
        0,
      );
    }

    /*
     * Encabezado pequeño "Calendario".
     */
    if (eyebrow) {
      timeline.add(
        {
          targets: eyebrow,
          opacity: [0, 1],
          translateY: [-70, 0],
          scale: [0.9, 1],
          duration: 550,
          easing: "easeOutExpo",
        },
        60,
      );
    }

    if (eyebrowLines.length > 0) {
      timeline.add(
        {
          targets: eyebrowLines,
          opacity: [0, 1],
          scaleX: [0, 1],
          duration: 500,
          delay: anime.stagger(80),
          easing: "easeOutExpo",
        },
        140,
      );
    }

    /*
     * Título principal.
     */
    if (heading) {
      timeline.add(
        {
          targets: heading,
          opacity: [0, 1],
          translateY: [-85, 0],
          scale: [0.9, 1],
          letterSpacing: ["0.08em", "0em"],
          duration: 800,
          easing: "easeOutExpo",
        },
        180,
      );
    }

    /*
     * Entrada de las dos tarjetas principales.
     */
    if (matchCard) {
      timeline.add(
        {
          targets: matchCard,
          opacity: [0, 1],
          translateX: [-330, 0],
          translateY: [85, 0],
          rotate: [-5, 0],
          scale: [0.84, 1],
          duration: 1050,
          easing: "easeOutExpo",
        },
        340,
      );
    }

    if (resultsCard) {
      timeline.add(
        {
          targets: resultsCard,
          opacity: [0, 1],
          translateX: [330, 0],
          translateY: [85, 0],
          rotate: [5, 0],
          scale: [0.84, 1],
          duration: 1050,
          easing: "easeOutExpo",
        },
        390,
      );
    }

    /*
     * Encabezados internos.
     */
    const internalHeaders = [
      matchHeader,
      resultsHeader,
    ].filter(
      (element): element is HTMLElement =>
        element !== null,
    );

    if (internalHeaders.length > 0) {
      timeline.add(
        {
          targets: internalHeaders,
          opacity: [0, 1],
          translateY: [-35, 0],
          duration: 500,
          delay: anime.stagger(100),
          easing: "easeOutCubic",
        },
        610,
      );
    }

    /*
     * Equipos y VS se ensamblan.
     */
    if (localTeam) {
      timeline.add(
        {
          targets: localTeam,
          opacity: [0, 1],
          translateX: [-170, 0],
          translateY: [55, 0],
          rotate: [-8, 0],
          scale: [0.72, 1],
          duration: 800,
          easing: "easeOutBack",
        },
        670,
      );
    }

    if (rivalTeam) {
      timeline.add(
        {
          targets: rivalTeam,
          opacity: [0, 1],
          translateX: [170, 0],
          translateY: [55, 0],
          rotate: [8, 0],
          scale: [0.72, 1],
          duration: 800,
          easing: "easeOutBack",
        },
        700,
      );
    }

    if (versus) {
      timeline.add(
        {
          targets: versus,
          opacity: [0, 1],
          translateY: [90, 0],
          rotate: [-12, 0],
          scale: [0.4, 1],
          duration: 750,
          easing: "easeOutElastic(1, .65)",
        },
        760,
      );
    }

    /*
     * Fecha, hora y jornada.
     */
    if (matchDetails) {
      timeline.add(
        {
          targets: matchDetails,
          opacity: [0, 1],
          translateY: [110, 0],
          scale: [0.92, 1],
          duration: 750,
          easing: "easeOutExpo",
        },
        900,
      );
    }

    /*
     * Estado alternativo sin próximo partido.
     */
    if (emptyState) {
      timeline.add(
        {
          targets: emptyState,
          opacity: [0, 1],
          translateY: [100, 0],
          scale: [0.9, 1],
          duration: 800,
          easing: "easeOutExpo",
        },
        720,
      );
    }

    /*
     * Resultados anteriores, uno por uno.
     */
    if (resultItems.length > 0) {
      timeline.add(
        {
          targets: resultItems,
          opacity: [0, 1],
          translateX: 0,
          translateY: 0,
          rotate: 0,
          scale: [0.88, 1],
          duration: 650,
          delay: anime.stagger(90),
          easing: "easeOutExpo",
        },
        720,
      );
    }

    let animationFrame: number | null = null;
    let animationStart = 0;
    let animationDistance = 1;

    /*
     * La construcción empieza mientras la sección
     * aparece desde abajo.
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
       * El montaje termina antes de salir de la sección.
       * El tramo final mantiene todo acomodado.
       */
      const assemblyProgress = Math.min(
        1,
        sectionProgress / 0.86,
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

      anime.remove([
        ...glows,
        eyebrow,
        ...eyebrowLines,
        heading,
        matchCard,
        matchHeader,
        localTeam,
        versus,
        rivalTeam,
        matchDetails,
        emptyState,
        resultsCard,
        resultsHeader,
        ...resultItems,
      ].filter(Boolean));
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="proximo-partido"
      className={`relative -mt-px h-[230vh] sm:h-[240vh] ${className}`}
    >
      <div
        ref={stageRef}
        className="sticky top-0 flex h-[100svh] items-center overflow-hidden py-12 sm:py-16 lg:py-20"
        style={{
          visibility: "hidden",
        }}
      >
        {children}
      </div>
    </section>
  );
}
