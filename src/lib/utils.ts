import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// TEXT HELPERS
// ============================================================================

/**
 * Capitalize the first letter of each whitespace-separated word and lowercase
 * the rest. Purely display-side — it does NOT mutate what's saved in the DB.
 *
 * Handles common edge cases:
 *   - "" / null / undefined → returns "" (caller can fall through to fallback)
 *   - "ADEGBOYEGA" → "Adegboyega"
 *   - "mary-jane" → "Mary-Jane" (handles hyphenated names)
 *   - "o'connor" → "O'Connor"
 *
 * For the banner and profile header only. If you need strict proper-noun
 * casing (like "McDonald"), do that at the edge of user input instead.
 */
export function toTitleCase(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .toLowerCase()
    .replace(/(^|[\s\-'])([a-z])/g, (_match, sep, ch: string) => sep + ch.toUpperCase())
}

/**
 * Capitalize only the first letter of a string. Useful when you want to
 * preserve any casing the user typed mid-word but still guarantee the
 * leading letter is uppercase (e.g. "iphone" → "Iphone").
 */
export function capitalizeFirst(value: string | null | undefined): string {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Build display initials from a first/last name pair. Falls back to the first
 * letter of the email if both names are empty. Returns an empty string when
 * nothing is usable (caller can render a placeholder icon in that case).
 */
export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  fallback?: string | null
): string {
  const first = (firstName || '').trim()
  const last = (lastName || '').trim()
  if (first || last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  }
  const fb = (fallback || '').trim()
  return fb ? fb.charAt(0).toUpperCase() : ''
}

// ============================================================================
// AVATAR HELPERS
// ============================================================================

/**
 * DiceBear style mapping. Different styles per gender so female and male
 * students are visibly distinct (single-style + gendered seed mixes both
 * looks in one bucket and the difference can be subtle). Both styles are
 * cartoon vector portraits with a similar enough vibe that they don't clash.
 *
 * Other styles worth trying if these don't land:
 *   - avataaars (classic SVG cartoons)
 *   - personas (modern flat illustration)
 *   - notionists (Notion-style minimalist)
 *   - micah (chunky 2D cartoon)
 */
const DICEBEAR_STYLE_BY_GENDER: Record<string, string> = {
  female: 'lorelei',
  male: 'avataaars',
}
const DICEBEAR_FALLBACK_STYLE = 'lorelei-neutral'

interface AvatarSeed {
  _id?: string | null
  admissionNumber?: string | null
  gender?: string | null
  profileImage?: string | null
  profilePicture?: string | null
}

/**
 * Resolve the avatar URL to render for a student / user.
 *
 * Order of preference:
 *   1. Uploaded image (profileImage or profilePicture)
 *   2. DiceBear-generated cartoon seeded by `${gender}-${_id|admissionNumber}`
 *   3. null — caller renders initials fallback
 *
 * The seed includes gender so changing a student's gender changes the avatar
 * (which is what an admin would expect). The seed is otherwise deterministic
 * per-student, so the same face shows up everywhere consistently.
 *
 * DiceBear serves SVG from a CDN, free, no API key. Render with a plain
 * <img> tag to skip Next/Image's external-SVG restrictions.
 */
export function getStudentAvatarUrl(student: AvatarSeed): string | null {
  if (!student) return null

  // 1. Honour an actually-uploaded avatar (Cloudinary).
  const uploaded =
    student.profileImage || student.profilePicture || null
  if (uploaded && uploaded !== '/img/avatar.jpg') return uploaded

  // 2. Generated avatar from DiceBear.
  const seedRoot = student._id || student.admissionNumber
  if (!seedRoot) return null

  const gender = (student.gender || '').toLowerCase()
  const style = DICEBEAR_STYLE_BY_GENDER[gender] || DICEBEAR_FALLBACK_STYLE
  const seed = encodeURIComponent(`${gender || 'neutral'}-${seedRoot}`)
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`
}
