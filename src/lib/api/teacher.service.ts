/**
 * Teacher (staff / role `admin`) Service
 *
 * Reads for the staff portal + approval-gated write submissions. Privileged
 * changes (student creation, timetable edits) do NOT write directly — they POST
 * an ApprovalRequest that the SuperAdmin approves, at which point the backend
 * executes the action.
 */

import apiClient, { ApiResponse } from './client';
import { API } from './endpoints';
import type { CreateStudentData } from './superAdmin.service';

// ============================================================================
// TYPES
// ============================================================================

/**
 * GET /admin/profile.
 *
 * Returned FLAT, matching the student profile endpoint — `res.data` IS the
 * profile, not `res.data.profile`.
 */
export interface TeacherProfile {
  _id: string;
  id?: string;
  teacherId?: string;
  staffId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: string;

  // Contact / demographics
  phoneNumber?: string;
  dateOfBirth?: string | null;
  gender?: string;
  address?: string;
  /** Local Government */
  city?: string;
  /** State of origin */
  state?: string;
  country?: string;

  // Work
  department?: string;
  subjects?: string[];
  /** GRADES they teach, e.g. ["JSS 1"] — set by an admin, not self-editable. */
  assignedClasses?: string[];
  bio?: string;
  qualifications?: string;
  specializations?: string;

  // Emergency
  nextOfKin?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  } | null;
  emergencyContact?: string;

  profileImage?: string;
  profilePicture?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

/** The subset of the profile a teacher may edit themselves. */
export type EditableTeacherProfile = Pick<
  TeacherProfile,
  | 'phoneNumber'
  | 'address'
  | 'city'
  | 'state'
  | 'country'
  | 'dateOfBirth'
  | 'gender'
  | 'emergencyContact'
  | 'bio'
  | 'qualifications'
  | 'specializations'
> & { nextOfKin?: TeacherProfile['nextOfKin'] };

/** One row of the teacher's schedule — a lesson they teach or an exam they invigilate. */
export interface TeacherScheduleEntry {
  _id: string;
  className: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  /** Classroom for lessons, exam hall for exams. */
  room: string | null;
  academicSession: string;
  term: string;
  type: 'class' | 'exam';
  /** ISO date — exams only. */
  examDate: string | null;
}

/**
 * GET /admin/timetable.
 *
 * NOTE the shape: the backend returns `timetable` keyed by day (all seven, so
 * weekend exams survive), plus flat `entries` / `lessons` / `exams` lists and
 * `assignedClasses` as plain GRADE STRINGS ("JSS 1"). It does not return the
 * `timetableByDay` / class-object shape the UI used to assume — that was a
 * leftover from the abandoned `Class` collection and always came back
 * undefined, which is why the staff timetable rendered empty.
 */
export interface TeacherTimetableResponse {
  timetable: Record<string, TeacherScheduleEntry[]>;
  entries: TeacherScheduleEntry[];
  lessons: TeacherScheduleEntry[];
  /** Exams this teacher is invigilating, already in date order. */
  exams: TeacherScheduleEntry[];
  assignedClasses: string[];
  totalPeriods: number;
}

export interface AssignedStudent {
  _id: string;
  admissionNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  /** The student's class INCLUDING the section, e.g. "JSS 1 A". */
  currentClass?: string;
  /** Legacy alias — some older callers read `className`. */
  className?: string;
  profileImage?: string;
  isActive?: boolean;
}

export interface AdminPaymentRow {
  _id: string;
  studentName: string;
  admissionNumber: string | null;
  className: string | null;
  description: string;
  paymentType: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  receiptNumber: string | null;
  date: string;
}

export interface MyRequest {
  _id: string;
  requestType:
    | 'user_creation'
    | 'timetable_change'
    | 'result_upload'
    | 'student_removal'
    | string;
  status: 'pending' | 'approved' | 'rejected';
  data?: unknown;
  metadata?: { summary?: string; [k: string]: unknown };
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
}

/** A structured timetable change to submit for approval. */
export interface TimetableEntryRequest {
  action: 'create' | 'update' | 'delete';
  timetableId?: string;
  entry?: {
    className: string;
    subject: string;
    teacherId: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    startTime: string;
    endTime: string;
    room?: string;
    academicSession: string;
    term: 'First' | 'Second' | 'Third';
  };
}

interface Paginated<T> {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
  items?: T;
}

/** One student's scores for a single subject, as typed into the entry sheet. */
export interface ResultEntry {
  studentId: string;
  firstCA?: number | null;
  secondCA?: number | null;
  exam?: number | null;
  remark?: string;
}

/**
 * A teacher submits ONE subject for a whole class at a time. This does not
 * publish — it creates an ApprovalRequest the admin has to approve.
 */
export interface ResultUploadRequest {
  className: string;
  subject: string;
  academicYear: string;
  term: 'First' | 'Second' | 'Third';
  entries: ResultEntry[];
}

/**
 * A subject line inside a stored Result document.
 *
 * Scores are NESTED under `scores` on the model — the totals and letter grade
 * are computed server-side on save, so they're read-only here.
 */
export interface ResultSubject {
  name: string;
  scores?: {
    firstCA?: number;
    secondCA?: number;
    exam?: number;
    total?: number;
  };
  grade?: string;
  remark?: string;
}

/** Score ceilings enforced by the Result model. */
export const SCORE_LIMITS = { firstCA: 20, secondCA: 20, exam: 60 } as const;

export interface ClassResultRow {
  _id: string;
  student: {
    _id: string;
    firstName?: string;
    lastName?: string;
    admissionNumber?: string;
    email?: string;
  } | null;
  academicYear: string;
  term: string;
  class: string;
  status?: string;
  subjects: ResultSubject[];
  summary?: {
    totalScore?: number;
    averageScore?: number;
    position?: number;
    grade?: string;
  };
}

export interface StaffNotification {
  id: string;
  _id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// READS
// ============================================================================

export const getTeacherProfile = async (): Promise<
  ApiResponse<TeacherProfile>
> => {
  return apiClient.get(API.TEACHER.PROFILE.GET);
};

export const updateTeacherProfile = async (
  updates: Partial<EditableTeacherProfile>
): Promise<ApiResponse<TeacherProfile>> => {
  return apiClient.put(API.TEACHER.PROFILE.UPDATE, updates);
};

export const getTeacherTimetable = async (): Promise<
  ApiResponse<TeacherTimetableResponse>
> => {
  return apiClient.get(API.TEACHER.TIMETABLE);
};

export const getAssignedStudents = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<
  ApiResponse<{
    students: AssignedStudent[];
    /** The grades this teacher is assigned to, e.g. ["JSS 1", "SS 2"]. */
    classes: string[];
    pagination: { total: number; page: number; pages: number; limit: number };
  }>
> => {
  return apiClient.get(API.TEACHER.ASSIGNED_STUDENTS, params);
};

export const getStudentDetail = async (
  studentId: string
): Promise<ApiResponse<any>> => {
  return apiClient.get(API.TEACHER.STUDENT_DETAIL(studentId));
};

export const getTeacherPayments = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<
  ApiResponse<{ payments: AdminPaymentRow[]; pagination: Paginated<never> }>
> => {
  return apiClient.get(API.TEACHER.PAYMENTS, params);
};

export const getMyRequests = async (params?: {
  status?: string;
  requestType?: string;
  page?: number;
  limit?: number;
}): Promise<
  ApiResponse<{
    requests: MyRequest[];
    pagination: { total: number; page: number; pages: number; limit: number };
  }>
> => {
  return apiClient.get(API.TEACHER.MY_REQUESTS, params);
};

/**
 * Results already recorded for one of my classes.
 *
 * `className` should be the GRADE ("JSS 1"), not a section — results are stored
 * per grade. Pass `subject` to trim each row down to just that subject.
 */
export const getClassResults = async (params: {
  className: string;
  subject?: string;
  term?: string;
  academicYear?: string;
}): Promise<
  ApiResponse<{
    className: string;
    results: ClassResultRow[];
    total: number;
  }>
> => {
  return apiClient.get(API.TEACHER.RESULTS_CLASS, params);
};

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const getStaffNotifications = async (params?: {
  isRead?: boolean;
  type?: string;
  priority?: string;
  page?: number;
  limit?: number;
}): Promise<
  ApiResponse<{
    notifications: StaffNotification[];
    unreadCount: number;
    pagination: { total: number; page: number; pages: number; limit: number };
  }>
> => {
  return apiClient.get(API.TEACHER.NOTIFICATIONS.LIST, params);
};

export const getStaffUnreadCount = async (): Promise<
  ApiResponse<{ total: number; count: number }>
> => {
  return apiClient.get(API.TEACHER.NOTIFICATIONS.UNREAD_COUNT);
};

export const markStaffNotificationRead = async (
  id: string
): Promise<ApiResponse<{ id: string; isRead: boolean }>> => {
  return apiClient.put(API.TEACHER.NOTIFICATIONS.MARK_READ(id), {});
};

export const markAllStaffNotificationsRead = async (): Promise<
  ApiResponse<{ updated: number }>
> => {
  return apiClient.put(API.TEACHER.NOTIFICATIONS.MARK_ALL_READ, {});
};

// ============================================================================
// APPROVAL-GATED WRITES
// ============================================================================

/**
 * Submit one subject's scores for a whole class → SA approves → the backend
 * writes/updates each student's Result for that year + term.
 */
export const submitResultUpload = async (
  data: ResultUploadRequest
): Promise<ApiResponse<{ requestId: string; status: string }>> => {
  return apiClient.post(API.TEACHER.REQUESTS.RESULT_UPLOAD, data);
};

/** Ask for a student to be removed from my class. */
export const submitStudentRemovalRequest = async (data: {
  studentId: string;
  className?: string;
  reason: string;
  evidence?: string[];
  urgent?: boolean;
}): Promise<ApiResponse<{ requestId: string; status: string }>> => {
  return apiClient.post(API.TEACHER.REQUESTS.STUDENT_REMOVAL, data);
};

/** Submit a "create student" request → SA approves → student is created. */
export const submitStudentCreationRequest = async (
  data: CreateStudentData
): Promise<ApiResponse<{ requestId: string; status: string }>> => {
  return apiClient.post(API.TEACHER.REQUESTS.CREATE_STUDENT, data);
};

/** Submit a structured timetable change → SA approves → applied. */
export const submitTimetableEntryRequest = async (
  data: TimetableEntryRequest
): Promise<ApiResponse<{ requestId: string; status: string }>> => {
  return apiClient.post(API.TEACHER.REQUESTS.TIMETABLE_ENTRY, data);
};

const teacherService = {
  getTeacherProfile,
  updateTeacherProfile,
  getTeacherTimetable,
  getAssignedStudents,
  getStudentDetail,
  getTeacherPayments,
  getMyRequests,
  getClassResults,
  getStaffNotifications,
  getStaffUnreadCount,
  markStaffNotificationRead,
  markAllStaffNotificationsRead,
  submitStudentCreationRequest,
  submitTimetableEntryRequest,
  submitResultUpload,
  submitStudentRemovalRequest,
};

export default teacherService;
