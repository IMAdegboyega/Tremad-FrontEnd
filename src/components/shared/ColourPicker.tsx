'use client';

import React from 'react';
import { Check } from 'lucide-react';
import {
  COLOUR_GROUPS,
  nameOfColour,
  type SubjectColour,
} from '@/Constants/subjectColours';

/**
 * Pick one colour from the fixed palette.
 *
 * Replaces a free `<input type="color">`. That let an admin choose any of
 * sixteen million values, which in practice meant two subjects a shade apart
 * on a timetable — and the only reason to colour-code a timetable is that you
 * can tell them apart without reading.
 *
 * COLOURS ARE EXCLUSIVE. One active subject per colour, so anything already
 * spoken for is shown struck through and can't be picked. Better to see that
 * Gold is gone and whose it is than to choose it and be refused on save.
 * Archiving a subject frees its colour and it reappears here.
 */

interface Props {
  value: string;
  onChange: (hex: string) => void;
  /** hex -> the subject holding it. Those become unpickable. */
  taken?: Record<string, string>;
  /** Left pickable even if taken — the colour this subject already has. */
  allow?: string;
  className?: string;
}

const ColourPicker: React.FC<Props> = ({
  value,
  onChange,
  taken = {},
  allow,
  className = '',
}) => {
  const isTaken = (c: SubjectColour) => {
    const owner = taken[c.hex.toLowerCase()];
    if (!owner) return null;
    // A subject keeping its own colour isn't a clash with itself.
    if (allow && allow.toLowerCase() === c.hex.toLowerCase()) return null;
    return owner;
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-4">
        {COLOUR_GROUPS.map((group) => (
          <div key={group.family}>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
              {group.family}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.colours.map((c) => {
                const owner = isTaken(c);
                const selected = value.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    disabled={Boolean(owner)}
                    onClick={() => onChange(c.hex)}
                    title={owner ? `${c.name} — used by ${owner}` : c.name}
                    aria-label={
                      owner
                        ? `${c.name}, already used by ${owner}`
                        : `${c.name}${selected ? ', selected' : ''}`
                    }
                    aria-pressed={selected}
                    className={`relative w-7 h-7 rounded-md transition-all ${
                      owner
                        ? 'opacity-25 cursor-not-allowed'
                        : 'hover:scale-110 cursor-pointer'
                    } ${
                      selected
                        ? 'ring-2 ring-offset-2 ring-gray-900'
                        : 'ring-1 ring-black/10'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selected && (
                      <Check
                        size={15}
                        strokeWidth={3}
                        className="absolute inset-0 m-auto text-white"
                      />
                    )}
                    {owner && (
                      // A diagonal bar reads as "taken" without relying on the
                      // fade alone, which is easy to miss on a dark swatch.
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="block w-full h-[2px] bg-white/80 rotate-45" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        {value ? (
          <>
            Selected: <span className="font-medium">{nameOfColour(value)}</span>
          </>
        ) : (
          'Pick a colour.'
        )}
      </p>
    </div>
  );
};

export default ColourPicker;
