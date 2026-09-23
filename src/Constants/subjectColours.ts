/**
 * Named colours for subjects and activities.
 *
 * WHY A FIXED PALETTE
 * A free colour input let an admin pick anything, which meant two subjects an
 * imperceptible shade apart on a timetable — and the point of colour-coding is
 * that you can tell them apart at a glance. It also produced a genuine clash:
 * the seeded catalogue gave Mathematics and French the same blue.
 *
 * Every colour is dark enough to carry white text, so a swatch works equally
 * as a dot, a chip, or a filled timetable cell.
 *
 * Grouped by family purely so the picker grid reads in a sensible order.
 *
 * GENERATED FROM ONE DEFINITION and mirrored in both repos — a colour that
 * exists on one side and not the other is a subject the server rejects for a
 * reason the UI can't explain.
 */

export interface SubjectColour {
  name: string;
  hex: string;
}

export interface ColourGroup {
  family: string;
  colours: SubjectColour[];
}

export const COLOUR_GROUPS: ColourGroup[] = [
  {
    family: 'Reds',
    colours: [
      { name: 'Red', hex: '#DC2626' },
      { name: 'Crimson', hex: '#B91C1C' },
      { name: 'Rose', hex: '#E11D48' },
      { name: 'Ruby', hex: '#9F1239' },
    ],
  },
  {
    family: 'Oranges',
    colours: [
      { name: 'Orange', hex: '#EA580C' },
      { name: 'Tangerine', hex: '#C2410C' },
      { name: 'Amber', hex: '#D97706' },
      { name: 'Bronze', hex: '#92400E' },
    ],
  },
  {
    family: 'Yellows',
    colours: [
      { name: 'Gold', hex: '#CA8A04' },
      { name: 'Mustard', hex: '#A16207' },
      { name: 'Ochre', hex: '#854D0E' },
    ],
  },
  {
    family: 'Greens',
    colours: [
      { name: 'Lime', hex: '#65A30D' },
      { name: 'Olive', hex: '#4D7C0F' },
      { name: 'Moss', hex: '#365314' },
      { name: 'Green', hex: '#16A34A' },
      { name: 'Forest', hex: '#15803D' },
      { name: 'Emerald', hex: '#059669' },
      { name: 'Jade', hex: '#047857' },
    ],
  },
  {
    family: 'Teals',
    colours: [
      { name: 'Teal', hex: '#0D9488' },
      { name: 'Pine', hex: '#0F766E' },
      { name: 'Cyan', hex: '#0891B2' },
      { name: 'Ocean', hex: '#0E7490' },
      { name: 'Lagoon', hex: '#155E75' },
    ],
  },
  {
    family: 'Blues',
    colours: [
      { name: 'Sky', hex: '#0284C7' },
      { name: 'Azure', hex: '#0369A1' },
      { name: 'Blue', hex: '#2563EB' },
      { name: 'Navy', hex: '#1D4ED8' },
      { name: 'Cobalt', hex: '#1E40AF' },
      { name: 'Steel', hex: '#1E3A8A' },
    ],
  },
  {
    family: 'Violets',
    colours: [
      { name: 'Indigo', hex: '#4F46E5' },
      { name: 'Iris', hex: '#4338CA' },
      { name: 'Violet', hex: '#7C3AED' },
      { name: 'Grape', hex: '#6D28D9' },
      { name: 'Purple', hex: '#9333EA' },
      { name: 'Plum', hex: '#7E22CE' },
    ],
  },
  {
    family: 'Pinks',
    colours: [
      { name: 'Magenta', hex: '#C026D3' },
      { name: 'Orchid', hex: '#A21CAF' },
      { name: 'Fuchsia', hex: '#DB2777' },
      { name: 'Pink', hex: '#BE185D' },
      { name: 'Blush', hex: '#9D174D' },
    ],
  },
  {
    family: 'Browns',
    colours: [
      { name: 'Coffee', hex: '#78350F' },
      { name: 'Clay', hex: '#7C2D12' },
      { name: 'Sienna', hex: '#9A3412' },
    ],
  },
  {
    family: 'Neutrals',
    colours: [
      { name: 'Slate', hex: '#475569' },
      { name: 'Graphite', hex: '#334155' },
      { name: 'Charcoal', hex: '#1E293B' },
      { name: 'Stone', hex: '#57534E' },
      { name: 'Ash', hex: '#44403C' },
    ],
  },
];

export const SUBJECT_COLOURS: SubjectColour[] = COLOUR_GROUPS.flatMap(
  (g) => g.colours
);

export const COLOUR_HEXES: string[] = SUBJECT_COLOURS.map((c) => c.hex);

const lower = (v?: string) => String(v ?? '').trim().toLowerCase();

export const isPaletteColour = (hex?: string): boolean =>
  COLOUR_HEXES.some((c) => c.toLowerCase() === lower(hex));

/** The human name for a colour, falling back to the hex for anything legacy. */
export const nameOfColour = (hex?: string): string =>
  SUBJECT_COLOURS.find((c) => c.hex.toLowerCase() === lower(hex))?.name ??
  String(hex ?? '');
