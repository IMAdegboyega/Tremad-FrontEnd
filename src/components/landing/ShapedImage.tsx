import React from 'react';
import Image from 'next/image';

/**
 * A plain rectangular photo rendered inside one of the landing page's shapes.
 *
 * WHY THIS EXISTS
 * The hero photos were pre-cut PNGs — 269x479 RGBA with the pill already baked
 * into the alpha channel — so swapping in an ordinary photograph broke the
 * look. The shape is now CSS, so ANY rectangular jpg/png takes it.
 *
 * ---------------------------------------------------------------------------
 * TWO THINGS THAT BITE WHEN THE SOURCE IS WIDE AND THE SHAPE IS TALL
 * ---------------------------------------------------------------------------
 *
 * 1. FRAMING. `object-fit: cover` scales until the short side fills, then
 *    crops the rest — from the CENTRE. On a landscape photo in a tall pill
 *    that throws away most of the width, and the subject is rarely dead
 *    centre. `focus` moves that window: it's `object-position`, so
 *    "50% 25%" keeps the horizontal centre but favours the upper quarter —
 *    usually where faces are.
 *
 * 2. SHARPNESS. This is the non-obvious one. A 1920x1080 photo in a 256x480
 *    pill shows only ~30% of its width. Next delivers a file sized for the
 *    BOX (~640px wide), you keep 30% of that (~192px), and those 192px get
 *    stretched across 512 device pixels on a 2x screen — a 2.7x upscale. The
 *    file looks high-resolution and still renders soft, because most of its
 *    pixels were cropped away before they reached the screen.
 *
 *    Two fixes, in order of preference:
 *      a) Crop the photo to portrait BEFORE adding it. A 1000x1500 source in
 *         this pill keeps 80% of its width and needs no upscaling at all.
 *      b) Pass `sourceAspect` and this component asks the browser for a
 *         proportionally larger file to compensate. Costs bandwidth — you're
 *         downloading pixels that get cropped — but it works without
 *         re-editing anything.
 */

export type ImageShape = 'pill' | 'leaf' | 'arch' | 'blob';

/**
 * Each shape is a border-radius. Deliberately not clip-path: border-radius is
 * cheaper, antialiases better, and every one of these is expressible as
 * corner radii.
 *
 * `blob` is the exception — see BLOB_PATH below.
 */
const SHAPE_RADIUS: Record<Exclude<ImageShape, 'blob'>, string> = {
  /** Fully rounded ends — the hero portraits. */
  pill: '9999px',
  /** Three rounded corners, one square — the Welcome section. */
  leaf: '200px 200px 0 200px',
  /** Rounded top, square base. */
  arch: '9999px 9999px 0 0',
};

/**
 * The Welcome section's organic blob — no corner radii can express it, so this
 * one is a clip-path.
 *
 * WHERE THIS CAME FROM
 * The shape only ever existed inside `welcometoschool.png`, baked into that
 * file's alpha channel along with the green line. It was recovered by tracing
 * the PNG: Moore-neighbour boundary walk over the alpha mask, Douglas-Peucker
 * to thin 1703 boundary pixels down to 50 points, then Catmull-Rom through
 * those points converted to cubic Béziers.
 *
 * THREE THINGS THE NAIVE TRACE GOT WRONG, all measured rather than eyeballed:
 *
 * 1. The decorative green line swings away from the photo near the top, so the
 *    outer boundary enclosed the empty gap between line and photo as if it
 *    were blob. Tracing the raw alpha scored only 0.92 IoU because of it. A
 *    morphological opening (erode 6px, dilate 6px) deletes the thin line and
 *    leaves the thick photo body alone; tracing THAT gives the photo's edge.
 *
 * 2. The PNG's canvas clips the blob. Its alpha touches the right border for
 *    rows 229-298, so the trace recorded a dead-straight vertical run with a
 *    hard corner at each end — the visible notch this shape used to have. The
 *    right-edge profile was refitted (quadratic over the clean rows either
 *    side, R^2 0.991, rms 0.96px) and extrapolated through the clipped band.
 *    The peak lands at x=596.5 against a 597px canvas, so almost no shape was
 *    actually missing — what the repair removes is the corners, not the
 *    flatness. That stretch of the blob really is near-straight.
 *
 * 3. The bounding box is NOT the canvas. The PNG has transparent margins top
 *    and bottom: the blob itself is 596.5 x 512.7, aspect 1.163, not the
 *    597/546 = 1.093 the file size suggests. Using the canvas aspect squashed
 *    the shape vertically.
 *
 * Final path is 0.9948 IoU against the repaired mask.
 *
 * Coordinates are 0..1 (objectBoundingBox), so the path stretches to whatever
 * box it's given — which is why the box must be given BLOB_ASPECT.
 */
const BLOB_PATH =
  'M0.3659,0.0016C0.3712,-0.0009 0.4048,-0.0000 0.4196,0.0016C0.4301,0.0027 0.4377,0.0045 0.4464,0.0074C0.4551,0.0104 0.4634,0.0131 0.4715,0.0191C0.4819,0.0268 0.4910,0.0378 0.5017,0.0523C0.5181,0.0746 0.5412,0.1251 0.5554,0.1440C0.5625,0.1534 0.5668,0.1579 0.5738,0.1635C0.5808,0.1690 0.5892,0.1738 0.5973,0.1771C0.6049,0.1802 0.6116,0.1818 0.6207,0.1830C0.6333,0.1845 0.6474,0.1853 0.6660,0.1830C0.6973,0.1791 0.7568,0.1571 0.7901,0.1518C0.8120,0.1483 0.8286,0.1461 0.8454,0.1479C0.8600,0.1494 0.8727,0.1526 0.8856,0.1596C0.9008,0.1677 0.9174,0.1832 0.9292,0.1966C0.9398,0.2087 0.9468,0.2206 0.9544,0.2356C0.9634,0.2536 0.9721,0.2785 0.9778,0.2980C0.9827,0.3146 0.9856,0.3301 0.9879,0.3449C0.9899,0.3579 0.9885,0.3732 0.9912,0.3819C0.9929,0.3871 0.9964,0.3880 0.9979,0.3936C1.0011,0.4046 0.9998,0.4280 0.9996,0.4463C0.9994,0.4662 0.9992,0.4963 0.9963,0.5087C0.9949,0.5143 0.9929,0.5146 0.9912,0.5204C0.9869,0.5352 0.9846,0.5766 0.9778,0.6023C0.9715,0.6264 0.9617,0.6516 0.9527,0.6706C0.9458,0.6852 0.9398,0.6954 0.9309,0.7076C0.9207,0.7215 0.9076,0.7380 0.8940,0.7486C0.8816,0.7582 0.8698,0.7656 0.8538,0.7700C0.8334,0.7757 0.8030,0.7749 0.7800,0.7739C0.7597,0.7731 0.7422,0.7674 0.7230,0.7661C0.7036,0.7648 0.6829,0.7630 0.6643,0.7661C0.6466,0.7691 0.6259,0.7771 0.6140,0.7837C0.6065,0.7879 0.6030,0.7914 0.5973,0.7973C0.5896,0.8053 0.5820,0.8147 0.5738,0.8286C0.5603,0.8512 0.5430,0.8991 0.5302,0.9241C0.5216,0.9409 0.5149,0.9540 0.5067,0.9651C0.5003,0.9738 0.4943,0.9810 0.4866,0.9865C0.4792,0.9919 0.4703,0.9963 0.4615,0.9982C0.4525,1.0002 0.4425,1.0008 0.4330,0.9982C0.4218,0.9952 0.4092,0.9869 0.3994,0.9787C0.3897,0.9706 0.3838,0.9623 0.3743,0.9495C0.3588,0.9285 0.3342,0.8823 0.3190,0.8617C0.3100,0.8496 0.3044,0.8425 0.2955,0.8344C0.2865,0.8262 0.2773,0.8186 0.2653,0.8130C0.2512,0.8063 0.2361,0.8024 0.2150,0.7993C0.1813,0.7943 0.1122,0.8017 0.0809,0.7954C0.0632,0.7918 0.0515,0.7868 0.0407,0.7798C0.0316,0.7739 0.0249,0.7675 0.0189,0.7583C0.0115,0.7471 0.0050,0.7306 0.0021,0.7154C-0.0009,0.6995 -0.0006,0.6812 0.0021,0.6647C0.0049,0.6481 0.0109,0.6361 0.0189,0.6160C0.0326,0.5813 0.0636,0.5273 0.0809,0.4775C0.1000,0.4227 0.1081,0.3577 0.1262,0.3000C0.1440,0.2433 0.1709,0.1716 0.1882,0.1342C0.1976,0.1141 0.2028,0.1035 0.2134,0.0893C0.2248,0.0741 0.2403,0.0581 0.2553,0.0464C0.2690,0.0358 0.2838,0.0280 0.2989,0.0211C0.3135,0.0144 0.3319,0.0081 0.3441,0.0055C0.3520,0.0038 0.3613,0.0050 0.3642,0.0035C0.3653,0.0030 0.3648,0.0021 0.3659,0.0016Z';

/**
 * The outline, as its OWN path rather than BLOB_PATH scaled up.
 *
 * The first version drew the outline by scaling BLOB_PATH into a box inset by
 * -9px. That looks like an offset and isn't: scaling is a dilation about the
 * centre, so the line drifts — measured 5.2px from the edge in some places and
 * 9.9px in others, which reads as the outline peeling away from the photo.
 *
 * A true outward offset is the Minkowski sum with a disc, i.e. a morphological
 * dilation, so this path is the 9px-dilated mask traced the same way. Measured
 * gap is now 7.5-11.2px, mean 9.4px, and the residual is sampling granularity.
 *
 * Because it sits OUTSIDE the element box its coordinates go slightly negative
 * and past 1 — hence overflow-visible on the svg. It also means the blob's
 * outline offset is baked in here, so `outline.offset` is ignored for `blob`.
 */
const BLOB_OUTLINE_PATH =
  'M0.3659,-0.0160C0.3712,-0.0184 0.4039,-0.0178 0.4196,-0.0160C0.4321,-0.0145 0.4429,-0.0117 0.4531,-0.0082C0.4623,-0.0050 0.4697,-0.0028 0.4782,0.0035C0.4903,0.0124 0.5026,0.0273 0.5151,0.0445C0.5325,0.0683 0.5549,0.1188 0.5688,0.1362C0.5752,0.1442 0.5795,0.1475 0.5855,0.1518C0.5913,0.1558 0.5957,0.1592 0.6040,0.1615C0.6183,0.1655 0.6420,0.1676 0.6660,0.1654C0.7005,0.1622 0.7568,0.1395 0.7901,0.1342C0.8120,0.1307 0.8293,0.1290 0.8454,0.1303C0.8580,0.1313 0.8693,0.1347 0.8789,0.1381C0.8866,0.1408 0.8915,0.1427 0.8990,0.1479C0.9113,0.1563 0.9308,0.1746 0.9426,0.1888C0.9531,0.2014 0.9602,0.2128 0.9678,0.2278C0.9768,0.2458 0.9852,0.2681 0.9912,0.2902C0.9977,0.3141 1.0001,0.3474 1.0046,0.3663C1.0074,0.3778 1.0112,0.3829 1.0130,0.3936C1.0154,0.4082 1.0149,0.4280 1.0147,0.4463C1.0145,0.4662 1.0143,0.4855 1.0113,0.5087C1.0076,0.5385 0.9997,0.5799 0.9912,0.6101C0.9841,0.6354 0.9751,0.6594 0.9661,0.6784C0.9592,0.6930 0.9536,0.7027 0.9443,0.7154C0.9328,0.7311 0.9130,0.7534 0.9007,0.7642C0.8932,0.7708 0.8880,0.7740 0.8806,0.7778C0.8725,0.7820 0.8651,0.7853 0.8538,0.7876C0.8355,0.7913 0.8030,0.7925 0.7800,0.7915C0.7597,0.7907 0.7422,0.7850 0.7230,0.7837C0.7036,0.7824 0.6822,0.7806 0.6643,0.7837C0.6485,0.7865 0.6315,0.7932 0.6207,0.7993C0.6134,0.8034 0.6092,0.8074 0.6040,0.8130C0.5979,0.8194 0.5935,0.8255 0.5872,0.8364C0.5752,0.8571 0.5564,0.9070 0.5436,0.9319C0.5350,0.9487 0.5290,0.9608 0.5202,0.9729C0.5121,0.9840 0.5035,0.9949 0.4933,1.0021C0.4838,1.0089 0.4726,1.0138 0.4615,1.0158C0.4503,1.0178 0.4375,1.0172 0.4263,1.0138C0.4145,1.0103 0.4031,1.0030 0.3927,0.9943C0.3811,0.9847 0.3723,0.9728 0.3609,0.9573C0.3442,0.9347 0.3192,0.8880 0.3056,0.8695C0.2988,0.8603 0.2957,0.8563 0.2888,0.8500C0.2806,0.8425 0.2702,0.8340 0.2586,0.8286C0.2459,0.8226 0.2319,0.8191 0.2150,0.8169C0.1925,0.8139 0.1596,0.8180 0.1346,0.8169C0.1125,0.8158 0.0905,0.8154 0.0725,0.8110C0.0579,0.8074 0.0452,0.8029 0.0340,0.7954C0.0229,0.7879 0.0124,0.7759 0.0055,0.7661C-0.0001,0.7583 -0.0032,0.7510 -0.0063,0.7427C-0.0094,0.7342 -0.0118,0.7263 -0.0130,0.7154C-0.0146,0.6997 -0.0146,0.6753 -0.0113,0.6569C-0.0081,0.6397 -0.0025,0.6283 0.0055,0.6082C0.0192,0.5735 0.0501,0.5195 0.0675,0.4697C0.0866,0.4149 0.0947,0.3499 0.1128,0.2922C0.1306,0.2355 0.1575,0.1638 0.1748,0.1264C0.1842,0.1063 0.1890,0.0963 0.1999,0.0815C0.2127,0.0643 0.2318,0.0440 0.2486,0.0308C0.2627,0.0197 0.2766,0.0125 0.2922,0.0055C0.3084,-0.0019 0.3307,-0.0092 0.3441,-0.0121C0.3523,-0.0138 0.3613,-0.0125 0.3642,-0.0140C0.3653,-0.0146 0.3648,-0.0154 0.3659,-0.0160Z';

/**
 * The blob's true aspect — from the traced shape's bounding box, NOT the PNG's
 * canvas. The box this renders in must use it, or the shape distorts and the
 * outline (offset in the shape's own units) stops tracking the edge.
 */
export const BLOB_ASPECT = 596.5 / 512.7;

/**
 * A stable DOM id for the clipPath, without useId().
 *
 * useId() is a hook, which would force 'use client' on a component that has no
 * other reason to be one. Two blobs with the same src would collide — but they
 * would also be the same shape, so sharing one clipPath is correct anyway.
 */
function shapeId(src: string): string {
  let h = 0;
  for (let i = 0; i < src.length; i++) h = (Math.imul(31, h) + src.charCodeAt(i)) | 0;
  return `blob-${(h >>> 0).toString(36)}`;
}

interface Props {
  src: string;
  alt: string;
  /** Tailwind sizing for the box, e.g. "w-64 h-120". */
  className?: string;
  shape?: ImageShape;
  /** Thin outline offset from the shape. Omit for none. */
  outline?: { color?: string; offset?: number; width?: number };

  /**
   * Which part of the photo stays visible, as `object-position`.
   * Keywords ("top", "center", "left top") or percentages ("50% 25%").
   * First value is horizontal, second vertical; 0% = left/top.
   */
  focus?: string;

  /**
   * Push in past `cover`. 1 = no change, 1.15 = 15% closer. Use sparingly —
   * it magnifies whatever softness is already there.
   */
  zoom?: number;

  /** CSS px this renders at on desktop. Drives the `sizes` calculation. */
  renderWidth?: number;

  /**
   * Natural aspect of the SOURCE file (width / height), e.g. 16/9 ≈ 1.78.
   * Supplying it lets the component request a bigger file to survive the
   * crop — see note 2 above. Leave unset for photos already near portrait.
   */
  sourceAspect?: number;

  /** Aspect of the BOX itself. Defaults to the hero pill (256x480). */
  boxAspect?: number;

  /** Overrides the computed `sizes` entirely, if you'd rather be explicit. */
  sizes?: string;

  /** next/image quality. 75 is the default; heavily-cropped art wants more. */
  quality?: number;

  priority?: boolean;
}

/**
 * How much wider a file we need so the surviving crop still has enough pixels.
 *
 * With `cover`, a source wider than the box keeps only `boxAspect /
 * sourceAspect` of its width. Asking for that much extra cancels the loss.
 * Capped at 3x — past that the download cost stops being worth it and the
 * honest fix is to crop the file.
 */
function cropCompensation(sourceAspect?: number, boxAspect = 256 / 480): number {
  if (!sourceAspect || sourceAspect <= boxAspect) return 1;
  return Math.min(3, sourceAspect / boxAspect);
}

const ShapedImage: React.FC<Props> = ({
  src,
  alt,
  className = '',
  shape = 'pill',
  outline,
  focus = 'center',
  zoom = 1,
  renderWidth = 256,
  sourceAspect,
  boxAspect = 256 / 480,
  sizes,
  quality = 90,
  priority = false,
}) => {
  const isBlob = shape === 'blob';
  const radius = isBlob ? undefined : SHAPE_RADIUS[shape];
  const clipId = shapeId(src);

  // Ask for enough pixels to survive the crop, then let the browser pick the
  // nearest size up from next/image's generated srcset.
  const request = Math.round(renderWidth * cropCompensation(sourceAspect, boxAspect));
  const computedSizes =
    sizes ?? `(max-width: 768px) ${Math.round(request * 1.2)}px, ${request}px`;

  return (
    <div className={`relative ${className}`}>
      {isBlob && (
        // Zero-size carrier for the clipPath definition. `objectBoundingBox`
        // units mean the path is defined in 0..1 and scales to whatever box
        // the element happens to be, so no viewBox maths is needed here.
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d={BLOB_PATH} />
            </clipPath>
          </defs>
        </svg>
      )}

      <div
        className="w-full h-full overflow-hidden relative z-10"
        style={{
          borderRadius: radius,
          ...(isBlob ? { clipPath: `url(#${clipId})` } : {}),
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={computedSizes}
          quality={quality}
          priority={priority}
          className="object-cover"
          style={{
            objectPosition: focus,
            // Scaling from the focal point keeps whatever you framed centred
            // as it zooms, instead of drifting toward the middle.
            ...(zoom !== 1
              ? { transform: `scale(${zoom})`, transformOrigin: focus }
              : {}),
          }}
        />
      </div>

      {outline &&
        (isBlob ? (
          // Sits on the element box exactly (inset 0) and shares the clip
          // path's coordinate frame — the offset lives in the path itself, so
          // nothing here needs to scale or shift. `non-scaling-stroke` keeps
          // the line an even weight all the way round.
          <svg
            aria-hidden="true"
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
            className="absolute inset-0 z-20 pointer-events-none overflow-visible"
          >
            <path
              d={BLOB_OUTLINE_PATH}
              fill="none"
              stroke={outline.color ?? '#D9D9D9'}
              strokeWidth={outline.width ?? 1}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        ) : (
          <div
            aria-hidden="true"
            className="absolute z-20 pointer-events-none"
            style={{
              inset: -(outline.offset ?? 7),
              borderRadius: radius,
              border: `${outline.width ?? 1}px solid ${outline.color ?? '#D9D9D9'}`,
            }}
          />
        ))}
    </div>
  );
};

export default ShapedImage;
