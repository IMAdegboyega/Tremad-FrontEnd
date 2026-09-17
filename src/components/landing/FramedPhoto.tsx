import React from 'react';
import Image from 'next/image';

/**
 * A photo in a white "print" frame, optionally tilted — the decorative pair
 * beside the Contact form.
 *
 * WHY THIS EXISTS
 * Same story as ShapedImage. `Contact1.png` and `Contact2.png` had the frame,
 * the rounded corners AND the rotation baked into the pixels, so swapping the
 * photograph meant rebuilding the whole card in an image editor. All three are
 * presentation, not content, so all three are now CSS and any plain
 * rectangular jpg/png drops in.
 *
 * THE NUMBERS BELOW ARE MEASURED, NOT GUESSED
 * Both source PNGs were analysed to recover what the designer actually did:
 *
 *   Contact1.png  275x279 canvas, card 274x277  tilt  0.00deg
 *   Contact2.png  316x319 canvas, card 278x275  tilt +9.75deg (clockwise)
 *
 *   - card aspect  ~1:1 (0.989 and 1.012) -> square
 *   - white frame  5px on 274, 6-7px on 278 -> 2% of the card's width
 *   - corner radius ~8-10px on a 275px card -> ~3% of width
 *   - drop shadow  NONE. Only 0.4-0.8% of pixels have partial alpha, which is
 *     antialiasing along the rotated edges, not a shadow. Hence `shadow`
 *     defaults to false — turn it on if you want depth the originals lacked.
 *
 * SHARPNESS
 * A landscape photo in a square frame loses its sides to `object-fit: cover`,
 * so the same crop compensation ShapedImage uses applies here: pass
 * `sourceAspect` and the component asks for a proportionally larger file.
 */

interface Props {
  src: string;
  alt: string;
  /** Positioning and size for the card, e.g. "absolute top-4 left-0 w-[200px]". */
  className?: string;

  /** Degrees, positive = clockwise. The originals used 0 and +9.75. */
  tilt?: number;

  /** White border as a percentage of the card's width. */
  frame?: number;

  /** Outer corner radius in px at `renderWidth`. */
  radius?: number;

  /** `object-position` — which part of the photo survives the square crop. */
  focus?: string;

  /** Natural aspect of the source file (width / height). */
  sourceAspect?: number;

  /** Aspect of the card. The originals are square. */
  boxAspect?: number;

  /** CSS px the card renders at on desktop. Drives `sizes`. */
  renderWidth?: number;

  sizes?: string;
  quality?: number;

  /** Off by default — the source PNGs have no shadow. */
  shadow?: boolean;

  priority?: boolean;
}

/** See ShapedImage: a source wider than the box keeps only part of its width. */
function cropCompensation(sourceAspect: number | undefined, boxAspect: number): number {
  if (!sourceAspect || sourceAspect <= boxAspect) return 1;
  return Math.min(3, sourceAspect / boxAspect);
}

const FramedPhoto: React.FC<Props> = ({
  src,
  alt,
  className = '',
  tilt = 0,
  frame = 2,
  radius = 8,
  focus = 'center',
  sourceAspect,
  boxAspect = 1,
  renderWidth = 200,
  sizes,
  quality = 90,
  shadow = false,
  priority = false,
}) => {
  // The photo sits inside the frame, so it's narrower than the card by twice
  // the border. Its corners have to be tighter too or the white reads thicker
  // at the corners than along the edges.
  const framePx = (renderWidth * frame) / 100;
  const innerRadius = Math.max(2, radius - framePx);

  const request = Math.round(
    (renderWidth - 2 * framePx) * cropCompensation(sourceAspect, boxAspect)
  );
  const computedSizes =
    sizes ?? `(max-width: 768px) ${Math.round(request * 1.2)}px, ${request}px`;

  return (
    <div
      className={className}
      style={{
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
        // Without this the tilted card's edges shimmer during the hover
        // transform on some GPUs.
        backfaceVisibility: 'hidden',
      }}
    >
      <div
        className="w-full h-full bg-white"
        style={{
          borderRadius: radius,
          padding: `${frame}%`,
          boxShadow: shadow ? '0 8px 24px -8px rgba(16, 83, 74, 0.25)' : undefined,
        }}
      >
        <div
          className="relative w-full h-full overflow-hidden"
          style={{ borderRadius: innerRadius }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={computedSizes}
            quality={quality}
            priority={priority}
            className="object-cover"
            style={{ objectPosition: focus }}
          />
        </div>
      </div>
    </div>
  );
};

export default FramedPhoto;
