/**
 * Student Service
 * 
 * Handles all Student related API calls.
 */

import apiClient, { ApiResponse } from './client';
import { API } from './endpoints';

// ============================================================================
// TYPES
// ============================================================================

export interface StudentProfile {
  _id: string;
  id?: string;
  admissionNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  className: string;
  currentClass?: string;
  isActive: boolean;
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  profilePicture?: string;
  profileImage?: string;

  // Contact / demographics
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;

  // Guardian / emergency contact
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  emergencyContact?: string;
}

/**
 * Body accepted by PUT /student/profile — every field is optional. Backend
 * restricts writes to a whitelist so fields like email/admissionNumber are
 * silently ignored.
 */
export interface UpdateStudentProfileInput {
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  emergencyContact?: string;
}

export interface SubjectResult {
  name: string;
  scores: {
    firstCA: number;
    secondCA: number;
    exam: number;
    total: number;
  };
  grade: string;
  remark?: string;
}

export interface ResultSummary {
  totalScore: number;
  averageScore: number;
  position: number | null;
  classSize: number | null;
  principalComment: string;
  classTeacherComment: string;
  performance?: { level: string; color: string };
}

/** One Result document = one student's full term result (all subjects). */
export interface Result {
  id: string;
  academicYear: string;
  term: string;
  class: string;
  status: string;
  subjects: SubjectResult[];
  summary: ResultSummary;
}

export interface TimetableEntry {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room?: string;
}

export interface Payment {
  _id: string;
  type: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  dueDate: string;
  paidDate?: string;
  reference?: string;
  academicYear: string;
  term: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'system';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: string;
}

// ============================================================================
// PROFILE
// ============================================================================

/**
 * Get student profile
 */
export const getProfile = async (): Promise<ApiResponse<StudentProfile>> => {
  return apiClient.get(API.STUDENT.PROFILE.GET);
};

/**
 * Update student profile (self-service — limited to demographic + guardian fields).
 */
export const updateProfile = async (
  updates: UpdateStudentProfileInput
): Promise<ApiResponse<StudentProfile>> => {
  return apiClient.put(API.STUDENT.PROFILE.UPDATE, updates);
};

/**
 * Change password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse> => {
  return apiClient.put(API.STUDENT.PROFILE.CHANGE_PASSWORD, {
    currentPassword,
    newPassword,
  });
};

/**
 * Upload (or replace) the current student's avatar. Backend streams the file
 * directly to Cloudinary and returns the CDN URL we should render.
 */
export const uploadAvatar = async (
  file: File
): Promise<ApiResponse<{ profileImage: string; profilePicture: string }>> => {
  const form = new FormData();
  form.append('avatar', file);
  return apiClient.upload(API.STUDENT.PROFILE.UPLOAD_AVATAR, form);
};

// ============================================================================
// ACADEMIC
// ============================================================================

/**
 * Get results
 */
export const getResults = async (params?: {
  academicYear?: string;
  term?: string;
}): Promise<ApiResponse<Result[]>> => {
  return apiClient.get(API.STUDENT.ACADEMIC.RESULTS, params);
};

/**
 * Download results as PDF
 */
export const downloadResults = async (params?: {
  academicYear?: string;
  term?: string;
}): Promise<Blob> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${API.STUDENT.ACADEMIC.RESULTS_DOWNLOAD}?${new URLSearchParams(params as any)}`,
    {
      headers: {
        Authorization: `Bearer ${apiClient.getToken()}`,
      },
    }
  );
  return response.blob();
};

/**
 * Get timetable
 */
export const getTimetable = async (): Promise<ApiResponse<TimetableEntry[]>> => {
  return apiClient.get(API.STUDENT.ACADEMIC.TIMETABLE);
};

// ============================================================================
// PAYMENTS
// ============================================================================

/**
 * Get payment history
 */
export const getPaymentHistory = async (): Promise<ApiResponse<Payment[]>> => {
  return apiClient.get(API.STUDENT.PAYMENTS.HISTORY);
};

/**
 * Get payment receipt
 */
export const getPaymentReceipt = async (paymentId: string): Promise<Blob> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${API.STUDENT.PAYMENTS.RECEIPT(paymentId)}`,
    {
      headers: {
        Authorization: `Bearer ${apiClient.getToken()}`,
      },
    }
  );
  return response.blob();
};

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Get all notifications
 */
export const getNotifications = async (): Promise<ApiResponse<Notification[]>> => {
  return apiClient.get(API.STUDENT.NOTIFICATIONS.GET_ALL);
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (
  notificationId: string
): Promise<ApiResponse> => {
  return apiClient.put(API.STUDENT.NOTIFICATIONS.MARK_READ(notificationId));
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (): Promise<ApiResponse<{ count: number }>> => {
  return apiClient.get(API.STUDENT.NOTIFICATIONS.UNREAD_COUNT);
};

// ============================================================================
// EXPORT ALL
// ============================================================================

const studentService = {
  // Profile
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,

  // Academic
  getResults,
  downloadResults,
  getTimetable,

  // Payments
  getPaymentHistory,
  getPaymentReceipt,

  // Notifications
  getNotifications,
  markNotificationRead,
  getUnreadNotificationCount,
};

export default studentService;
