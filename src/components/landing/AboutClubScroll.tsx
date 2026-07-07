
"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import anime from "animejs";

interface AboutClubScrollProps {
  children: ReactNode;
  className?: string;
}

export function AboutClubScroll({
  children,
  className = "",
}: AboutClubScrollProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;

    if (!section || !stage) {
      return;
    }

    const shield =
      stage.querySelector<HTMLElement>(
        "[data-about-shield]",
      );

    const foundationBadge =
      stage.querySelector<HTMLElement>(
        "[data-about-foundation]",
      );

    const eyebrow =
      stage.querySelector<HTMLElement>(
        "[data-about-eyebrow]",
      );

    const eyebrowLine =
      stage.querySelector<HTMLElement>(
        "[data-about-eyebrow-line]",
      );

    const heading =
      stage.querySelector<HTMLElement>(
        "[data-about-heading]",
      );

    const description =
      stage.querySelector<HTMLElement>(
        "[data-about-description]",
      );

    const cards = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-about-card]",
      ),
    );

    const glows = Array.from(
      stage.querySelectorAll<HTMLElement>(
        "[data-about-glow]",
      ),
    );

    if (
      !shield ||
      !foundationBadge ||
      !eyebrow ||
      !eyebrowLine ||
      !heading ||
      !description ||
      cards.length === 0
    ) {
      stage.style.visibility = "visible";
      return;
    }

    /*
     * Respeta la preferencia del sistema operativo.
     * En modo de movimiento reducido se muestra todo
     * directamente, sin animación.
     */
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotion.matches) {
      stage.style.visibility = "visible";
      return;
    }

    /*
     * Estado inicial desarmado.
     */
    anime.set(glows, {
      opacity: 0,
      scale: 0.55,
    });

    anime.set(shield, {
      opacity: 0.12,
      translateX: -320,
      translateY: 110,
      rotate: -16,
      scale: 0.72,
    });

    anime.set(foundationBadge, {
      opacity: 0,
      translateX: -90,
      translateY: 150,
      rotate: -12,
      scale: 0.72,
    });

    anime.set(eyebrow, {
      opacity: 0,
      translateX: 140,
      translateY: -30,
    });

    anime.set(eyebrowLine, {
      scaleX: 0,
      transformOrigin: "left center",
    });

    anime.set(heading, {
      opacity: 0,
      translateX: 230,
      translateY: 35,
      rotate: 2,
      scale: 0.94,
    });

    anime.set(description, {
      opacity: 0,
      translateX: 120,
      translateY: 90,
    });

    cards.forEach((card, index) => {
      anime.set(card, {
        opacity: 0,
        translateX: index % 2 === 0 ? -65 : 65,
        translateY: 150 + index * 12,
        rotate: index % 2 === 0 ? -4 : 4,
        scale: 0.86,
      });
    });

    /*
     * Evita un destello de los elementos ya montados
     * antes de que Anime.js establezca sus posiciones.
     */
    stage.style.visibility = "visible";

    /*
     * Timeline pausada.
     *
     * El scroll decidirá manualmente su posición.
     */
    const timeline = anime.timeline({
      autoplay: false,
      easing: "linear",
    });

    timeline
      /*
       * Aparecen las luces ambientales.
       */
      .add(
        {
          targets: glows,
          opacity: [0, 1],
          scale: [0.55, 1],
          duration: 700,
          easing: "easeOutCubic",
        },
        0,
      )

      /*
       * El escudo entra desde la izquierda
       * y se coloca en su posición final.
       */
      .add(
        {
          targets: shield,
          opacity: [0.12, 1],
          translateX: [-320, 0],
          translateY: [110, 0],
          rotate: [-16, 0],
          scale: [0.72, 1],
          duration: 1050,
          easing: "easeOutExpo",
        },
        0,
      )

      /*
       * La insignia del año acompaña al escudo.
       */
      .add(
        {
          targets: foundationBadge,
          opacity: [0, 1],
          translateX: [-90, 0],
          translateY: [150, 0],
          rotate: [-12, 0],
          scale: [0.72, 1],
          duration: 800,
          easing: "easeOutExpo",
        },
        280,
      )

      /*
       * Aparece el encabezado pequeño "El club".
       */
      .add(
        {
          targets: eyebrow,
          opacity: [0, 1],
          translateX: [140, 0],
          translateY: [-30, 0],
          duration: 600,
          easing: "easeOutCubic",
        },
        170,
      )

      /*
       * Se dibuja la línea naranja.
       */
      .add(
        {
          targets: eyebrowLine,
          scaleX: [0, 1],
          duration: 500,
          easing: "easeOutExpo",
        },
        220,
      )

      /*
       * El título entra desde la derecha.
       */
      .add(
        {
          targets: heading,
          opacity: [0, 1],
          translateX: [230, 0],
          translateY: [35, 0],
          rotate: [2, 0],
          scale: [0.94, 1],
          duration: 850,
          easing: "easeOutExpo",
        },
        320,
      )

      /*
       * El párrafo se acomoda debajo del título.
       */
      .add(
        {
          targets: description,
          opacity: [0, 1],
          translateX: [120, 0],
          translateY: [90, 0],
          duration: 750,
          easing: "easeOutExpo",
        },
        550,
      )

      /*
       * Las tarjetas aparecen una por una.
       */
      .add(
        {
          targets: cards,
          opacity: [0, 1],
          translateX: 0,
          translateY: 0,
          rotate: 0,
          scale: [0.86, 1],
          duration: 750,
          delay: anime.stagger(100),
          easing: "easeOutExpo",
        },
        720,
      );

    let animationFrame: number | null = null;
    let isNear = false;

    let animationStart = 0;
    let animationDistance = 1;

    /*
     * La animación comienza cuando AboutClub empieza
     * a entrar desde la parte inferior del viewport.
     *
     * No espera hasta que la sección llegue completamente
     * arriba; así se conecta visualmente con el Hero.
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
        window.innerHeight * 0.8;

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
       * La animación termina al 88 % del recorrido.
       *
       * El 12 % final mantiene la composición montada
       * antes de pasar a ProximoPartido.
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
     * Observer de proximidad: solo procesamos eventos de scroll
     * cuando la sección está cerca del viewport. Reduce el costo
     * de scroll cuando hay varias secciones scroll-driven en la página.
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
    // Estado inicial: si la sección ya está cerca al montar, marcamos isNear=true
    // para que el primer updateTimeline efectivamente corra.
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

      anime.remove([
        ...glows,
        shield,
        foundationBadge,
        eyebrow,
        eyebrowLine,
        heading,
        description,
        ...cards,
      ]);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about-club"
      className={`relative -mt-px h-[160vh] ${className}`}
    >
      <div
        ref={stageRef}
        className="sticky top-0 flex h-[100svh] items-center overflow-hidden pt-20 lg:pt-24"
        style={{
          visibility: "hidden",
        }}
      >
        {children}
      </div>
    </section>
  );
}
