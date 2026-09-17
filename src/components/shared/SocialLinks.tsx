'use client';

/**
 * The school's social links, as small icon buttons.
 *
 * Driven entirely by `/public/settings`, so the school controls which
 * platforms appear by setting (or leaving blank) the SCHOOL_* env vars. A
 * blank var means that platform simply isn't rendered — no dead icon linking
 * to nowhere, which is what the landing page footer currently does.
 *
 * ICONS: these are brand marks, so they come from files in /public/icon rather
 * than being drawn here. `facebook.svg` and `whatsapp.svg` don't exist in the
 * project yet — drop them in and they'll appear automatically. Until then a
 * missing file falls back to a labelled text pill (see `onError`), so a
 * configured link is never invisible just because its icon is absent.
 */

import React, { useState } from 'react';

export interface SocialContact {
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  linkedin?: string;
}

interface Props {
  contact?: SocialContact | null;
  /** Rendered above the row when at least one link exists. */
  label?: string;
  className?: string;
}

/** Platform → the icon file we expect and the label we fall back to. */
const PLATFORMS: Array<{
  key: keyof SocialContact;
  name: string;
  icon: string;
}> = [
  { key: 'whatsapp', name: 'WhatsApp', icon: '/icon/whatsapp.svg' },
  { key: 'instagram', name: 'Instagram', icon: '/icon/insta.svg' },
  { key: 'facebook', name: 'Facebook', icon: '/icon/facebook.svg' },
  { key: 'tiktok', name: 'TikTok', icon: '/icon/tiktok.svg' },
  { key: 'twitter', name: 'X', icon: '/icon/X.svg' },
  { key: 'linkedin', name: 'LinkedIn', icon: '/icon/linkedin.svg' },
];

/**
 * A bare handle or phone number is not a URL. Schools tend to enter
 * "@tremadschools" or "08012345678", so build something clickable from it
 * rather than producing a link that 404s.
 */
const toHref = (key: keyof SocialContact, value: string): string => {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;

  const handle = v.replace(/^@/, '');
  switch (key) {
    case 'whatsapp':
      // wa.me wants digits only, with country code and no leading +.
      return `https://wa.me/${v.replace(/[^0-9]/g, '')}`;
    case 'instagram':
      return `https://instagram.com/${handle}`;
    case 'facebook':
      return `https://facebook.com/${handle}`;
    case 'tiktok':
      return `https://tiktok.com/@${handle}`;
    case 'twitter':
      return `https://x.com/${handle}`;
    case 'linkedin':
      return `https://linkedin.com/company/${handle}`;
    default:
      return v;
  }
};

const SocialIcon: React.FC<{ src: string; name: string }> = ({ src, name }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="text-xs font-medium text-gray-600">{name}</span>;
  }

  return (
    // Plain <img>: these are tiny static SVGs, and next/image adds no value
    // while making the onError fallback harder to reach.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={18}
      height={18}
      className="w-[18px] h-[18px]"
      onError={() => setFailed(true)}
    />
  );
};

const SocialLinks: React.FC<Props> = ({
  contact,
  label = 'Follow us',
  className = '',
}) => {
  const available = PLATFORMS.filter((p) => {
    const value = contact?.[p.key];
    return typeof value === 'string' && value.trim().length > 0;
  });

  if (available.length === 0) return null;

  return (
    <div className={className}>
      {label && (
        <p className="text-xs text-gray-500 mb-2">{label}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {available.map((p) => (
          <a
            key={p.key}
            href={toHref(p.key, contact![p.key] as string)}
            target="_blank"
            rel="noopener noreferrer"
            title={p.name}
            aria-label={p.name}
            className="flex items-center justify-center min-w-[38px] h-[38px] px-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <SocialIcon src={p.icon} name={p.name} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialLinks;
