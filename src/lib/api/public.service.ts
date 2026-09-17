/**
 * Public Service
 *
 * The only service that talks to the API WITHOUT a token. Every call passes
 * `false` for `includeAuth` — a prospective parent has no account, and sending
 * a stale token from a previous session would be meaningless at best.
 */

import apiClient, { ApiResponse } from './client';
import { API } from './endpoints';

// ============================================================================
// TYPES
// ============================================================================

export interface PublicSettings {
  formFee: number;
  currency: string;
  /** False when the gateway keys aren't configured — the form says so. */
  paymentAvailable: boolean;
  academicYear: string;
  contact: {
    email: string;
    phone: string;
    address: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
    twitter: string;
    tiktok: string;
    linkedin: string;
  };
}

/**
 * One row of published content. Which fields matter depends on `kind`:
 *   books  → title = book, subtitle = author, amount = price
 *   bills  → title = item, term = when due,  amount = amount
 *   scheme → title = subject, term = term,   note   = topics
 */
export interface ContentItem {
  _id: string;
  title: string;
  subtitle: string;
  amount: number | null;
  term: string;
  note: string;
  optional: boolean;
}

export interface ContentDoc {
  _id: string;
  kind: ContentKind;
  className: string;
  academicYear: string;
  studentType: 'fresh' | 'returning' | 'all';
  note: string;
  items: ContentItem[];
  /** Sum of non-optional amounts, computed server-side. */
  total: number;
  updatedAt: string;
}

export type ContentKind = 'books' | 'bills' | 'scheme';

export interface ApplicationInput {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  classApplyingFor: string;
  previousSchool?: string;
  guardianName: string;
  guardianRelationship?: string;
  guardianPhone: string;
  guardianEmail: string;
  address?: string;
  city?: string;
  state?: string;
  preferredContact?: 'visit' | 'call' | 'email';
  notes?: string;
}

export interface ApplicationCreated {
  reference: string;
  amount: number;
  currency: string;
  /** Paystack checkout URL — the applicant leaves the site for this. */
  authorizationUrl: string;
  accessCode?: string;
}

export type ApplicationStatus =
  | 'payment_pending'
  | 'submitted'
  | 'under_review'
  | 'invited'
  | 'offered'
  | 'declined'
  | 'withdrawn';

export interface ApplicationStatusResult {
  reference: string;
  status: ApplicationStatus;
  paid: boolean;
  firstName: string;
  classApplyingFor: string;
  submittedAt: string | null;
  createdAt: string;
}

export interface ContactInput {
  kind: 'enquiry' | 'complaint' | 'feedback';
  name: string;
  email: string;
  phone?: string;
  preferredContact?: 'visit' | 'call' | 'email';
  subject?: string;
  message: string;
  relatedStudentName?: string;
}

// ============================================================================
// CALLS
// ============================================================================

export const getPublicSettings = async (): Promise<
  ApiResponse<PublicSettings>
> => apiClient.get(API.PUBLIC.SETTINGS, undefined, false);

export const getPublicContent = async (
  kind: ContentKind,
  params?: {
    className?: string;
    academicYear?: string;
    studentType?: 'fresh' | 'returning';
  }
): Promise<ApiResponse<{ kind: ContentKind; content: ContentDoc[] }>> =>
  apiClient.get(API.PUBLIC.CONTENT(kind), params, false);

export const submitContactMessage = async (
  data: ContactInput
): Promise<ApiResponse<null>> =>
  apiClient.post(API.PUBLIC.CONTACT, data, false);

/**
 * Saves the application and returns a checkout URL. Nothing is "submitted"
 * until the fee clears — see verifyApplicationPayment.
 */
export const submitApplication = async (
  data: ApplicationInput
): Promise<ApiResponse<ApplicationCreated>> =>
  apiClient.post(API.PUBLIC.APPLICATIONS, data, false);

/** Called when the applicant returns from the gateway. */
export const verifyApplicationPayment = async (
  reference: string
): Promise<
  ApiResponse<{ reference: string; status: ApplicationStatus; paid: boolean }>
> =>
  apiClient.post(API.PUBLIC.APPLICATION_VERIFY(reference), {}, false);

export const trackApplication = async (
  reference: string
): Promise<ApiResponse<ApplicationStatusResult>> =>
  apiClient.get(API.PUBLIC.APPLICATION(reference), undefined, false);

const publicService = {
  getPublicSettings,
  getPublicContent,
  submitContactMessage,
  submitApplication,
  verifyApplicationPayment,
  trackApplication,
};

export default publicService;
