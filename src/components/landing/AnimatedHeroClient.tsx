"use client";

import Image from "next/image";
import Link from "next/link";
import { forwardRef, useEffect, useRef } from "react";
import anime from "animejs";
import type { ClubConfig } from "@/types";

const LAYERS_PATH = "/brand/kravitt-layers";

export function AnimatedHeroClient({
  club,
}: {
  club: ClubConfig;
}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const logoStageRef = useRef<HTMLDivElement | null>(null);

  const glowRef = useRef<HTMLDivElement | null>(null);
  const shieldFillRef = useRef<HTMLDivElement | null>(null);
  const shieldOutlineRef = useRef<HTMLDivElement | null>(null);
  const topTextRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const moonRef = useRef<HTMLDivElement | null>(null);
  const starRef = useRef<HTMLDivElement | null>(null);
  const bottomTextRef = useRef<HTMLDivElement | null>(null);

  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    const logoStage = logoStageRef.current;

    const glow = glowRef.current;
    const shieldFill = shieldFillRef.current;
    const shieldOutline = shieldOutlineRef.current;
    const topText = topTextRef.current;
    const ring = ringRef.current;
    const moon = moonRef.current;
    const star = starRef.current;
    const bottomText = bottomTextRef.current;

    const scrollIndicator = scrollIndicatorRef.current;

    if (
      !container ||
      !content ||
      !logoStage ||
      !glow ||
      !shieldFill ||
      !shieldOutline ||
      !topText ||
      !ring ||
      !moon ||
      !star ||
      !bottomText ||
      !scrollIndicator
    ) {
      return;
    }

    const animatedElements = [
      content,
      logoStage,
      glow,
      shieldFill,
      shieldOutline,
      topText,
      ring,
      moon,
      star,
      bottomText,
      scrollIndicator,
    ];

    anime.set(animatedElements, {
      translateX: 0,
      translateY: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
    });

    const timeline = anime.timeline({
      autoplay: false,
      easing: "linear",
    });

    timeline
      .add(
        {
          targets: scrollIndicator,
          translateY: [0, 28],
          opacity: [1, 0],
          duration: 300,
          easing: "linear",
        },
        0,
      )
      .add(
        {
          targets: logoStage,
          translateY: [0, -18],
          scale: [1, 1.035],
          duration: 1750,
          easing: "easeInOutQuad",
        },
        0,
      )
      .add(
        {
          targets: topText,
          translateX: [0, -18],
          translateY: [0, -205],
          rotate: [0, -7],
          scale: [1, 1.06],
          opacity: [1, 0],
          duration: 650,
          easing: "easeInQuad",
        },
        80,
      )
      .add(
        {
          targets: bottomText,
          translateX: [0, 18],
          translateY: [0, 205],
          rotate: [0, 7],
          scale: [1, 1.06],
          opacity: [1, 0],
          duration: 700,
          easing: "easeInQuad",
        },
        170,
      )
      .add(
        {
          targets: ring,
          scale: [1, 1.78],
          rotate: [0, 38],
          opacity: [1, 0],
          duration: 950,
          easing: "easeInOutCubic",
        },
        300,
      )
      .add(
        {
          targets: moon,
          translateX: [0, -245],
          translateY: [0, -92],
          rotate: [0, -88],
          scale: [1, 1.16],
          opacity: [1, 0],
          duration: 1000,
          easing: "easeInOutCubic",
        },
        470,
      )
      .add(
        {
          targets: star,
          translateX: [0, 255],
          translateY: [0, -42],
          rotate: [0, 210],
          scale: [1, 1.32],
          opacity: [1, 0],
          duration: 1000,
          easing: "easeInOutCubic",
        },
        560,
      )
      .add(
        {
          targets: shieldOutline,
          translateY: [0, 38],
          scale: [1, 1.03],
          opacity: [1, 0],
          duration: 750,
          easing: "easeOutQuad",
        },
        690,
      )
      .add(
        {
          targets: shieldFill,
          translateY: [0, 185],
          rotate: [0, 4],
          scale: [1, 0.9],
          opacity: [1, 0],
          duration: 1100,
          easing: "easeInOutQuad",
        },
        650,
      )
      .add(
        {
          targets: glow,
          scale: [1, 1.9],
          opacity: [1, 0],
          duration: 1250,
          easing: "easeOutQuad",
        },
        260,
      )
      .add(
        {
          targets: content,
          translateX: [0, -90],
          translateY: [0, -34],
          opacity: [1, 0],
          duration: 900,
          easing: "easeInOutQuad",
        },
        480,
      );

    let animationFrame: number | null = null;
    let sectionStart = 0;
    let scrollDistance = 1;

    const measureSection = () => {
      sectionStart =
        container.getBoundingClientRect().top + window.scrollY;

      scrollDistance = Math.max(
        1,
        container.offsetHeight - window.innerHeight,
      );
    };

    const updateTimeline = () => {
      animationFrame = null;

      const localScroll = window.scrollY - sectionStart;

      const progress = Math.min(
        1,
        Math.max(0, localScroll / scrollDistance),
      );

      timeline.seek(timeline.duration * progress);
    };

    const requestTimelineUpdate = () => {
      if (animationFrame !== null) {
        return;
      }

      animationFrame =
        window.requestAnimationFrame(updateTimeline);
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

    window.addEventListener("resize", handleResize);

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
        window.cancelAnimationFrame(animationFrame);
      }

      timeline.pause();
      anime.remove(animatedElements);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-[300vh]"
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden pt-20 lg:pt-24">
        <div className="absolute inset-0 -z-10 bg-mesh-kravitt" />

        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 30%, rgba(237,123,44,0.18), transparent 50%), radial-gradient(circle at 20% 80%, rgba(15,52,56,0.6), transparent 60%)",
          }}
        />

        <div
          className="absolute inset-0 -z-20 opacity-20 mix-blend-screen"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-kravitt-deep via-transparent to-kravitt-deep" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-20 sm:px-8 lg:grid-cols-12 lg:gap-12">
          <div
            ref={contentRef}
            className="flex flex-col gap-6 will-change-[transform,opacity] lg:col-span-7 lg:gap-8"
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-12 bg-kravitt-orange" />

              <span className="text-xs font-medium uppercase tracking-[0.4em] text-kravitt-orange">
                Fundado en {club.fundacion}
              </span>
            </div>

            <h1 className="text-display text-5xl leading-[0.9] text-kravitt-cream sm:text-7xl lg:text-8xl xl:text-9xl">
              <span className="block">
                AFC
              </span>

              <span className="text-shine block">
                {club.nombreCorto}
              </span>
            </h1>

            <p className="text-display max-w-2xl text-2xl text-kravitt-cream/90 sm:text-3xl lg:text-4xl">
              {club.frase}
            </p>

            <p className="max-w-xl text-base leading-relaxed text-kravitt-cream/70 sm:text-lg">
              La plataforma oficial del club. Plantel,
              estadísticas, partidos y comunidad — todo lo que
              rodea a nuestro fútbol, en un solo lugar.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/equipo"
                className="group inline-flex items-center gap-2 rounded-full bg-kravitt-orange px-6 py-3 text-sm font-bold uppercase tracking-widest text-kravitt-deep shadow-kravitt-orange transition hover:bg-kravitt-orange-2 sm:px-8 sm:py-4"
              >
                Conoce al equipo

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12h15m0 0-6.75-6.75M19.5 12l-6.75 6.75"
                  />
                </svg>
              </Link>

              <Link
                href="/partidos"
                className="inline-flex items-center gap-2 rounded-full border border-kravitt-cream/30 px-6 py-3 text-sm font-bold uppercase tracking-widest text-kravitt-cream transition hover:border-kravitt-orange hover:text-kravitt-orange sm:px-8 sm:py-4"
              >
                Ver partidos
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:col-span-5 lg:justify-end">
            <div
              ref={logoStageRef}
              role="img"
              aria-label="Escudo oficial de Kravitt AFC"
              className="relative aspect-[909/1071] w-[240px] select-none sm:w-[325px] lg:w-[410px] xl:w-[475px]"
            >
              <div
                ref={glowRef}
                className="pointer-events-none absolute inset-[8%] rounded-full bg-kravitt-orange/20 blur-[90px] will-change-[transform,opacity]"
                aria-hidden="true"
              />

              <LogoLayer
                ref={shieldFillRef}
                src={`${LAYERS_PATH}/shield-fill.png`}
                className="z-10"
                transformOrigin="50% 55%"
              />

              <LogoLayer
                ref={shieldOutlineRef}
                src={`${LAYERS_PATH}/shield-outline.png`}
                className="z-20"
                transformOrigin="50% 55%"
              />

              <LogoLayer
                ref={ringRef}
                src={`${LAYERS_PATH}/orange-ring.png`}
                className="z-30"
                transformOrigin="50% 49%"
              />

              <LogoLayer
                ref={moonRef}
                src={`${LAYERS_PATH}/crescent-moon.png`}
                className="z-40"
                transformOrigin="43% 47%"
              />

              <LogoLayer
                ref={starRef}
                src={`${LAYERS_PATH}/star-sun.png`}
                className="z-50"
                transformOrigin="61% 46%"
              />

              <LogoLayer
                ref={topTextRef}
                src={`${LAYERS_PATH}/text-kravitt.png`}
                className="z-60"
                transformOrigin="50% 10%"
              />

              <LogoLayer
                ref={bottomTextRef}
                src={`${LAYERS_PATH}/text-afc.png`}
                className="z-60"
                transformOrigin="50% 88%"
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div
            ref={scrollIndicatorRef}
            className="flex flex-col items-center gap-2 text-kravitt-cream/40 will-change-[transform,opacity]"
          >
            <span className="text-[10px] uppercase tracking-[0.4em]">
              Scroll
            </span>

            <div className="h-10 w-px bg-gradient-to-b from-kravitt-orange to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

interface LogoLayerProps {
  src: string;
  className: string;
  transformOrigin: string;
}

const LogoLayer = forwardRef<
  HTMLDivElement,
  LogoLayerProps
>(({ src, className, transformOrigin }, ref) => {
  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 will-change-[transform,opacity] ${className}`}
      style={{ transformOrigin }}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt=""
        width={909}
        height={1071}
        priority
        unoptimized
        draggable={false}
        className="h-full w-full object-contain"
      />
    </div>
  );
});

LogoLayer.displayName = "LogoLayer";
