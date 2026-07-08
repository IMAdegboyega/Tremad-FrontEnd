import type {
  StudentProfile,
  UpdateStudentProfileInput,
} from '@/lib/api/student.service';

export interface ProfileData {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  country: string;
  gradeInfo: string;
  studentId: string;
  status: 'Active' | 'Inactive';
  // Academic Info
  studentAdmissionCID: string;
  currentGrade: string;
  classSection: string;
  admissionDate: string;
  // Guardian Info
  guardianName: string;
  relationship: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContact: string;
  // Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  schoolAnnouncements: boolean;
}

/**
 * Dates come back from the backend as ISO strings. Converts to YYYY-MM-DD so
 * the value is safe to round-trip through an <input type="text" /> and back.
 */
const toIsoDate = (value: string | Date | null | undefined): string => {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

/**
 * Returns an empty ProfileData shell. Used while the profile API call is still
 * in flight, or when certain fields aren't returned by the backend yet.
 */
export const emptyProfileData: ProfileData = {
  fullName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  address: '',
  city: '',
  state: '',
  country: '',
  gradeInfo: '',
  studentId: '',
  status: 'Active',
  studentAdmissionCID: '',
  currentGrade: '',
  classSection: '',
  admissionDate: '',
  guardianName: '',
  relationship: '',
  guardianPhone: '',
  guardianEmail: '',
  emergencyContact: '',
  emailNotifications: true,
  smsNotifications: true,
  schoolAnnouncements: true,
};

/**
 * Maps the API's StudentProfile shape to the richer ProfileData the UI form uses.
 * Fields the backend doesn't return yet stay empty strings.
 */
export const mapStudentProfileToProfileData = (
  profile: StudentProfile | null | undefined
): ProfileData => {
  if (!profile) return emptyProfileData;

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  const className = profile.className || profile.currentClass || '';
  const gradeInfo = [className, profile.admissionNumber]
    .filter(Boolean)
    .join(' • ');

  return {
    ...emptyProfileData,
    fullName,
    email: profile.email || '',
    phoneNumber: profile.phoneNumber || '',
    dateOfBirth: toIsoDate(profile.dateOfBirth),
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    country: profile.country || '',
    gradeInfo,
    studentId: profile.admissionNumber || '',
    status: profile.isActive ? 'Active' : 'Inactive',
    studentAdmissionCID: profile.admissionNumber || '',
    currentGrade: className,
    admissionDate: profile.createdAt
      ? new Date(profile.createdAt).toLocaleDateString('en-GB')
      : '',
    guardianName: profile.guardianName || '',
    relationship: profile.guardianRelationship || '',
    guardianPhone: profile.guardianPhone || '',
    guardianEmail: profile.guardianEmail || '',
    emergencyContact: profile.emergencyContact || '',
  };
};

/**
 * Extracts the subset of ProfileData that the student can self-edit, formatted
 * for the PUT /student/profile endpoint.
 */
export const profileDataToUpdateInput = (
  data: ProfileData
): UpdateStudentProfileInput => ({
  phoneNumber: data.phoneNumber || '',
  dateOfBirth: data.dateOfBirth || '',
  address: data.address || '',
  city: data.city || '',
  state: data.state || '',
  country: data.country || '',
  guardianName: data.guardianName || '',
  guardianPhone: data.guardianPhone || '',
  guardianEmail: data.guardianEmail || '',
  guardianRelationship: data.relationship || '',
  emergencyContact: data.emergencyContact || '',
});
