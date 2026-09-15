'use client';

/**
 * The Tremad loader — the school logo with a green arc sweeping around it.
 *
 * FOR WHOLE-PAGE WAITS ONLY: sign in, sign out, the forced password change,
 * confirming a payment. Anywhere there IS a layout to hint at, use a skeleton
 * instead — a full-screen loader over a page that could have shown its shape
 * is a step backwards.
 *
 * Three things here are behaviour, not decoration:
 *
 * 1. THE LOGO DOESN'T SPIN. Only the arc. A rotating crest reads as cheap and
 *    makes the school's mark unreadable.
 *
 * 2. REDUCED MOTION. A spinning ring is a real vestibular trigger, and a
 *    full-screen one can't be looked away from. Under
 *    `prefers-reduced-motion` the rotation is replaced by a slow opacity
 *    pulse — still clearly "working", nothing moving.
 *
 * 3. ANTI-FLASH TIMING. See `useDeferredLoading` below. This is the part that
 *    matters most and the part that's easiest to leave out.
 */

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/** Bright green from the existing palette — the landing page's accent. */
const RING = '69, 191, 91';

/**
 * Show a loader only if the wait is long enough to be worth acknowledging,
 * and once shown keep it long enough to be read.
 *
 * On a fast connection a login resolves in ~150ms. Rendering a full-screen
 * loader for 150ms produces a strobe — strictly worse than never showing one.
 * But a loader that appears and vanishes mid-blink is equally jarring, so once
 * it IS on screen it stays for a minimum beat.
 *
 * @param active   whether the underlying work is in progress
 * @param delayMs  wait this long before showing anything
 * @param minMs    once shown, stay at least this long
 */
export function useDeferredLoading(
  active: boolean,
  { delayMs = 200, minMs = 400 }: { delayMs?: number; minMs?: number } = {}
): boolean {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef<number | null>(null);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    if (active) {
      showTimer = setTimeout(() => {
        shownAt.current = Date.now();
        setVisible(true);
      }, delayMs);
    } else if (visible) {
      const elapsed = Date.now() - (shownAt.current ?? 0);
      const remaining = Math.max(0, minMs - elapsed);
      hideTimer = setTimeout(() => {
        shownAt.current = null;
        setVisible(false);
      }, remaining);
    }

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [active, visible, delayMs, minMs]);

  return visible;
}

interface Props {
  /** Optional line under the mark, e.g. "Signing you in". No ellipsis needed. */
  message?: string;
  /** Diameter of the ring in px. The logo scales with it. */
  size?: number;
  /**
   * `fullscreen` covers the viewport (sign in / sign out).
   * `inline` sits in the flow, for a card-sized wait.
   */
  variant?: 'fullscreen' | 'inline';
}

const TremadLoader: React.FC<Props> = ({
  message,
  size = 132,
  variant = 'fullscreen',
}) => {
  // The logo sits comfortably inside the ring with a small breathing gap.
  const logo = Math.round(size * 0.62);
  const stroke = Math.max(4, Math.round(size * 0.042));

  const ring = (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {/* Faint full circle — the track the arc travels along. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `${stroke}px solid rgba(${RING}, 0.15)`,
        }}
      />

      {/*
        The moving arc. A conic gradient masked into an annulus.

        It occupies ~110 degrees, NOT most of the circle: a long faint tail
        reads as a static ring outline rather than something travelling. A
        short, mostly-solid segment is what makes it legible as a spinner at a
        glance — with the head still brighter than the tail.
      */}
      <div
        className="tremad-loader-arc"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, rgba(${RING}, 0) 0deg, rgba(${RING}, 0) 250deg, rgba(${RING}, 0.25) 285deg, rgba(${RING}, 0.7) 330deg, rgb(${RING}) 358deg, rgb(${RING}) 360deg)`,
          WebkitMaskImage: `radial-gradient(farthest-side, transparent calc(100% - ${stroke}px), #000 calc(100% - ${stroke}px))`,
          maskImage: `radial-gradient(farthest-side, transparent calc(100% - ${stroke}px), #000 calc(100% - ${stroke}px))`,
        }}
      >
        {/* Rounded head — without it the leading edge is a blunt cut. */}
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: stroke,
            height: stroke,
            marginLeft: -stroke / 2,
            borderRadius: '50%',
            background: `rgb(${RING})`,
          }}
        />
      </div>

      {/* The real school crest, static — see note 1 at the top of this file. */}
      <Image
        src="/icon/logo.svg"
        alt=""
        width={logo}
        height={logo}
        priority
        style={{ width: logo, height: 'auto' }}
      />
    </div>
  );

  const body = (
    <div className="flex flex-col items-center gap-5">
      {ring}
      {message && (
        <p className="text-sm text-gray-500 text-center max-w-xs">{message}</p>
      )}
    </div>
  );

  // Keyframes and the reduced-motion fallback live in globals.css under
  // `.tremad-loader-arc` — keeping them there avoids a styled-jsx runtime
  // injection for something this simple.
  return variant === 'fullscreen' ? (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      // Translucent rather than solid: the page underneath stays faintly
      // visible, so the loader reads as an overlay on what you were doing
      // instead of a hard cut to a different screen. The blur keeps the mark
      // legible over busy layouts.
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/75 backdrop-blur-sm"
    >
      {body}
      <span className="sr-only">{message || 'Loading'}</span>
    </div>
  ) : (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex items-center justify-center py-12"
    >
      {body}
      <span className="sr-only">{message || 'Loading'}</span>
    </div>
  );
};

export default TremadLoader;
