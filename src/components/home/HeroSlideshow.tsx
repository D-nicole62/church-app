"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { heroSlides } from "@/lib/hero-slides";

const INTERVAL_MS = 6000;

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const count = heroSlides.length;

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/20 bg-black/20 shadow-lg shadow-black/20">
      <div className="relative aspect-[4/3] w-full sm:aspect-video">
        {heroSlides.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 420px"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-1.5 pb-3">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`pointer-events-auto h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/35 px-2 py-3 text-white backdrop-blur-sm transition hover:bg-black/50 sm:block"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/35 px-2 py-3 text-white backdrop-blur-sm transition hover:bg-black/50 sm:block"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
