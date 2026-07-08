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
import type { TimetableEntry } from './student.service';

// ============================================================================
// TYPES
// ============================================================================

export interface TeacherProfile {
  _id: string;
  teacherId?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  qualifications?: string;
  specializations?: string;
  profileImage?: string;
  profilePicture?: string;
  isActive?: boolean;
}

/** Grouped-by-day timetable as returned by GET /admin/timetable. */
export interface TeacherTimetableResponse {
  timetableByDay: Record<string, TimetableEntry[]>;
  assignedClasses: Array<{
    _id: string;
    name: string;
    section?: string;
    subjects?: Array<{ name: string; teacherId?: string }>;
  }>;
  totalPeriods: number;
}

export interface AssignedStudent {
  _id: string;
  admissionNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  className?: string;
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

// ============================================================================
// READS
// ============================================================================

export const getTeacherProfile = async (): Promise<
  ApiResponse<TeacherProfile>
> => {
  return apiClient.get(API.TEACHER.PROFILE.GET);
};

export const updateTeacherProfile = async (
  updates: Partial<
    Pick<
      TeacherProfile,
      'phoneNumber' | 'address' | 'bio' | 'qualifications' | 'specializations'
    >
  >
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
  ApiResponse<{ students: AssignedStudent[]; pagination: Paginated<never> }>
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

// ============================================================================
// APPROVAL-GATED WRITES
// ============================================================================

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
  submitStudentCreationRequest,
  submitTimetableEntryRequest,
};

export default teacherService;
