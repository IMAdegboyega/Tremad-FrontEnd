/**
 * Single source of truth for the school's contact info — the bits that
 * appear on every receipt, every email footer, etc. Editing one place
 * updates them everywhere they're rendered.
 *
 * When this grows beyond "a few static strings" (school logo, signatures,
 * multiple campuses), promote it to a SchoolSettings Mongo model + a
 * /super-admin/settings endpoint and have the components fetch from there.
 */

export interface SchoolInfo {
  name: string;
  /** Optional motto / tagline shown under the name. */
  tagline?: string;
  email: string;
  phones: string[];
  /** Multi-line address, rendered one line per array entry. */
  address: string[];
  /** Mailbox the receipt asks people to contact for finance questions. */
  financeEmail: string;
  /** Path to the logo SVG used on receipts. */
  logoPath: string;
}

/**
 * Update these values to match the real Tremad Schools details. They
 * surface on every printed / downloaded receipt.
 */
export const SCHOOL_INFO: SchoolInfo = {
  name: 'Tremad Schools',
  email: 'info@tremadschools.edu',
  phones: ['+234 806 117 8024', '+234 806 117 8024'],
  address: ['Plot 123, Tremad Avenue', 'Lagos, Nigeria'],
  financeEmail: 'finance@tremadschools.edu',
  logoPath: '/icon/receiptlogo.svg',
};
