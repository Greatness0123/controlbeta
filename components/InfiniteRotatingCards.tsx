"use client";

import React, { useEffect, useMemo, useRef } from "react";

type CardItem = {
  title: string;
  description: string;
  icon?: string; // fontawesome class suffix, e.g. "fa-wand-magic-sparkles"
};

export default function InfiniteRotatingCards({
  items,
  speedPxPerSecond = 80,
  className = "",
}: {
  items: CardItem[];
  speedPxPerSecond?: number;
  className?: string;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef<number | null>(null);

  // TranslateX position in pixels, in [0, halfWidth)
  const posRef = useRef(0);
  const halfWidthRef = useRef(0);

  // Drag state
  const dragActiveRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragStartPosRef = useRef(0);
  const dragLockedRef = useRef<'none' | 'horizontal' | 'vertical'>('none');

  // Momentum / inertia
  const velocityRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const lastMoveXRef = useRef(0);
  const momentumRafRef = useRef(0);

  // Duplicate items to make wrap-around seamless.
  const loopItems = useMemo(() => [...items, ...items], [items]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = now - last;
      last = now;

      if (!isInteractingRef.current) {
        // Apply momentum if velocity exists
        if (Math.abs(velocityRef.current) > 0.5) {
          const half = halfWidthRef.current;
          if (half > 0) {
            posRef.current = ((posRef.current - velocityRef.current * (dt / 16)) % half + half) % half;
            track.style.transform = `translate3d(${-posRef.current}px, 0, 0)`;
            velocityRef.current *= 0.95; // friction
          }
        } else {
          velocityRef.current = 0;
          const dx = (speedPxPerSecond * dt) / 1000;
          const half = halfWidthRef.current;

          if (half > 0) {
            posRef.current = (posRef.current + dx) % half;
            track.style.transform = `translate3d(${-posRef.current}px, 0, 0)`;
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speedPxPerSecond]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const measure = () => {
      // Track includes two copies; half is exactly one copy's width.
      const half = track.scrollWidth / 2;
      halfWidthRef.current = half;
      // Normalize current position to [0, half) and apply transform immediately.
      if (half > 0) posRef.current = ((posRef.current % half) + half) % half;
      track.style.transform = `translate3d(${-posRef.current}px, 0, 0)`;
    };

    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [items]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const onWheel = (e: WheelEvent) => {
      // Horizontal wheel should move carousel. Vertical wheel also nudges it (trackpads).
      const half = halfWidthRef.current;
      if (half <= 0) return;
      beginInteract();
      posRef.current = (posRef.current + (e.deltaX || e.deltaY)) % half;
      track.style.transform = `translate3d(${-posRef.current}px, 0, 0)`;
      endInteract();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && (e.buttons & 1) === 0) return;
      const half = halfWidthRef.current;
      if (half <= 0) return;
      beginInteract();
      velocityRef.current = 0;
      dragActiveRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartYRef.current = e.clientY;
      dragStartPosRef.current = posRef.current;
      dragLockedRef.current = 'none';
      lastMoveTimeRef.current = performance.now();
      lastMoveXRef.current = e.clientX;
      if (e.pointerType === "mouse") {
        (e.target as Element)?.setPointerCapture?.(e.pointerId);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragActiveRef.current) return;
      const half = halfWidthRef.current;
      if (half <= 0) return;
      const dx = e.clientX - dragStartXRef.current;
      const dy = e.clientY - dragStartYRef.current;

      // Lock direction on first significant movement (for touch)
      if (dragLockedRef.current === 'none' && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        dragLockedRef.current = Math.abs(dx) >= Math.abs(dy) ? 'horizontal' : 'vertical';
      }

      // If locked to vertical, release so the page can scroll
      if (dragLockedRef.current === 'vertical') {
        dragActiveRef.current = false;
        endInteract();
        return;
      }

      // Prevent vertical scrolling while dragging horizontally
      if (dragLockedRef.current === 'horizontal') {
        e.preventDefault();
      }

      // Track velocity for momentum
      const now = performance.now();
      const timeDelta = now - lastMoveTimeRef.current;
      if (timeDelta > 0) {
        velocityRef.current = (e.clientX - lastMoveXRef.current) / Math.max(timeDelta / 16, 1);
      }
      lastMoveTimeRef.current = now;
      lastMoveXRef.current = e.clientX;

      posRef.current = ((dragStartPosRef.current - dx) % half + half) % half;
      track.style.transform = `translate3d(${-posRef.current}px, 0, 0)`;
    };

    const onPointerUp = () => {
      if (!dragActiveRef.current) return;
      dragActiveRef.current = false;
      dragLockedRef.current = 'none';
      endInteract();
    };

    viewport.addEventListener("wheel", onWheel, { passive: true });
    viewport.addEventListener("pointerdown", onPointerDown, { passive: true });
    viewport.addEventListener("pointermove", onPointerMove, { passive: true });
    viewport.addEventListener("pointerup", onPointerUp, { passive: true });
    viewport.addEventListener("pointercancel", onPointerUp, { passive: true });

    return () => {
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  const beginInteract = () => {
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const endInteract = () => {
    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = window.setTimeout(() => {
      isInteractingRef.current = false;
    }, 1500);
  };

  return (
    <div className={className}>
      <div
        ref={viewportRef}
        className="no-scrollbar overflow-hidden select-none"
        style={{ touchAction: "pan-y", cursor: "grab" }}
        onMouseEnter={beginInteract}
        onMouseLeave={endInteract}
      >
        <div ref={trackRef} className="flex gap-4 will-change-transform">
          {loopItems.map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              className="shrink-0 w-[280px] sm:w-[320px] md:w-[360px] glass-card border border-border rounded-2xl p-5 md:p-6"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-10 h-10 shrink-0 rounded-xl bg-accent-purple/10 flex items-center justify-center border border-border">
                  <i className={`fas ${item.icon ?? "fa-bolt"} text-accent-purple leading-none`}></i>
                </div>
                <div className="min-w-0">
                  <div className="text-foreground font-bold text-base md:text-lg leading-snug">
                    {item.title}
                  </div>
                  <div className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* <div className="mt-3 text-xs text-muted-foreground text-center">
        Drag / scroll to explore — auto-rotates when idle.
      </div> */}
    </div>
  );
}

