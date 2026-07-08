/**
 * API Module Index
 * 
 * Export all API-related modules from a single entry point.
 * 
 * Usage:
 *   import { API, authService, apiClient, superAdminService } from '@/lib/api';
 */

// ============================================================================
// CONFIGURATION
// ============================================================================
export { API, API_BASE_URL } from './endpoints';

// ============================================================================
// API CLIENT
// ============================================================================
export { 
  default as apiClient,
  get,
  post,
  put,
  patch,
  del,
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  isAuthenticated,
} from './client';

export type { ApiResponse, ApiError } from './client';

// ============================================================================
// AUTH SERVICE
// ============================================================================
export { 
  default as authService,
  // Super Admin
  superAdminGoogleLogin,
  superAdminLogin,
  superAdminVerifyOtp,
  superAdminResendOtp,
  superAdminChangePassword,
  superAdminLogout,
  // Student
  studentLogin,
  studentChangePassword,
  studentForgotPasswordRequest,
  studentForgotPasswordVerifyOtp,
  studentForgotPasswordReset,
  studentLogout,
  // Teacher
  teacherLogin,
  teacherChangePassword,
  teacherLogout,
} from './auth.service';

export type {
  SuperAdminLoginResponse,
  SuperAdminVerifyOtpResponse,
  StudentLoginResponse,
  PasswordChangeRequiredResponse,
  ForgotPasswordRequestResponse,
  ForgotPasswordVerifyResponse,
} from './auth.service';

// ============================================================================
// SUPER ADMIN SERVICE
// ============================================================================
export {
  default as superAdminService,
  // User Management
  createStudent,
  createStaff,
  resetUserPassword,
  forceLogoutUser,
  removeUser,
  // Student Management
  getStudents,
  getStudent,
  updateStudent,
  // Admission Pool
  getAdmissionPoolStatus,
  generateAdmissionPool,
  // Approvals
  getPendingApprovals,
  approveRequest,
  denyRequest,
  // Notifications
  getNotificationAnalytics,
  sendBroadcastNotification,
  // Analytics
  getDashboardAnalytics,
  getActivityTrends,
  // Monitoring
  getAuditLogs,
} from './superAdmin.service';

export type {
  Student,
  CreateStudentData,
  CreateStudentResponse,
  Staff,
  CreateStaffData,
  PaginatedResponse,
  AdmissionPoolStatus,
  PendingApproval,
  AuditLog,
  DashboardAnalytics,
} from './superAdmin.service';

// ============================================================================
// STUDENT SERVICE
// ============================================================================
export {
  default as studentService,
  getProfile,
  updateProfile,
  getResults,
  downloadResults,
  getTimetable,
  getPaymentHistory,
  getPaymentReceipt,
  getNotifications,
  markNotificationRead,
  getUnreadNotificationCount,
} from './student.service';

export type {
  StudentProfile,
  UpdateStudentProfileInput,
  Result,
  TimetableEntry,
  Payment,
  Notification,
} from './student.service';

// ============================================================================
// TEACHER (STAFF) SERVICE
// ============================================================================
export {
  default as teacherService,
  getTeacherProfile,
  updateTeacherProfile,
  getTeacherTimetable,
  getAssignedStudents,
  getStudentDetail,
  getTeacherPayments,
  getMyRequests,
  submitStudentCreationRequest,
  submitTimetableEntryRequest,
} from './teacher.service';

export type {
  TeacherProfile,
  TeacherTimetableResponse,
  AssignedStudent,
  AdminPaymentRow,
  MyRequest,
  TimetableEntryRequest,
} from './teacher.service';
