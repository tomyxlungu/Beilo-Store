'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';

export interface HeroSlide {
  id: string;
  title: string;
  eyebrow?: string;
  subtext?: string;
  image?: string;
  ctaText?: string;
  href?: string;
  offer?: string;
}

/**
 * Homepage hero carousel (mobile-first refactor, section 2).
 * Scroll-snap track (native swipe) with dots + prev/next controls.
 * Pure presentation: slides are shaped by the server page from CMS
 * hero blocks (looks as fallback). No data fetching or routing
 * logic lives here.
 */
export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track || slides.length < 2) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' });
  }, [slides.length]);

  // Keep dots in sync while swiping (rAF-throttled).
  useEffect(() => {
    const track = trackRef.current;
    if (!track || slides.length < 2) return;

    let frame = 0;
    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = track.clientWidth || 1;
        setIndex(Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / width))));
      });
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frame);
    };
  }, [slides.length]);

  if (slides.length === 0) return null;

  const showControls = slides.length > 1;

  return (
    <section
      className="hero-carousel"
      aria-roledescription="carousel"
      aria-label="Featured stories"
    >
      <div ref={trackRef} className="hero-carousel-track">
        {slides.map((slide, i) => (
          <article
            key={slide.id}
            className="hero-section hero-carousel-slide"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}: ${slide.title}`}
          >
            {slide.image && (
              <div className="hero-section-bg" aria-hidden="true">
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  sizes="100vw"
                  className="hero-section-bg-img"
                  priority={i === 0}
                />
                <div className="hero-section-bg-overlay" />
              </div>
            )}
            <div className="hero-section-content">
              {slide.eyebrow && (
                <p className="hero-section-label">{slide.eyebrow}</p>
              )}
              <h1 className="hero-section-title">{slide.title}</h1>
              {slide.subtext && (
                <p className="hero-section-subtext">{slide.subtext}</p>
              )}
              {slide.ctaText && (
                <Link
                  href={slide.href || '/shop'}
                  className="hero-section-cta"
                  tabIndex={showControls && i !== index ? -1 : undefined}
                >
                  {slide.ctaText} <span aria-hidden="true">→</span>
                </Link>
              )}
              {slide.offer && (
                <p className="hero-section-offer">
                  <Tag size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{slide.offer}</span>
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      {showControls && (
        <div className="hero-carousel-controls">
          <button
            type="button"
            className="slider-btn hero-carousel-arrow"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <div className="hero-carousel-dots" role="tablist" aria-label="Choose slide">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}: ${slide.title}`}
                className={`hero-carousel-dot${i === index ? ' hero-carousel-dot--active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="slider-btn hero-carousel-arrow"
            onClick={() => goTo(index + 1)}
            disabled={index === slides.length - 1}
            aria-label="Next slide"
          >
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </section>
  );
}
