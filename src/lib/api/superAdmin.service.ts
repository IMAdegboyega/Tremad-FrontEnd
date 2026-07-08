/**
 * Super Admin Service
 * 
 * Handles all Super Admin related API calls.
 */

import apiClient, { ApiResponse } from './client';
import { API } from './endpoints';

// ============================================================================
// TYPES
// ============================================================================

export interface Student {
  _id: string;
  admissionNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  className: string;
  currentClass?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  profileImage?: string;
  profilePicture?: string;

  // Demographics (returned by getStudent in detail view; usually undefined on list rows)
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
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
 * Payload accepted by POST /super-admin/create-student.
 *
 * Required: identity + class. Everything else is optional but recommended —
 * the backend now persists demographics + guardian info when provided, so the
 * student profile page has data to show out of the box.
 *
 * `relationship` is what the create form uses; the backend re-maps it to the
 * canonical `guardianRelationship` field on the User model.
 */
export interface CreateStudentData {
  // Identity
  email: string;
  firstName: string;
  lastName: string;
  // Academic
  className: string;
  // Demographics
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  // Guardian / emergency contact
  guardianName?: string;
  relationship?: string;
  guardianRelationship?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  emergencyContact?: string;
}

export interface CreateStudentResponse {
  id: string;
  admissionNumber: string;
  email: string;
  tempPassword: string;
}

export interface Staff {
  _id: string;
  /** Server-generated identifier returned from createStaff. */
  staffId?: string;
  /** Newer field — same idea as staffId. Backend populates one or the other. */
  teacherId?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher';
  department?: string;
  position?: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  hireDate?: string;
  profileImage?: string;
  profilePicture?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateStaffData {
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  role: 'admin' | 'teacher';
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
}

export interface AdmissionPoolStatus {
  year: number;
  total: number;
  available: number;
  assigned: number;
  reserved: number;
  deactivated: number;
  recentlyAssigned: any[];
}

export interface PendingApproval {
  _id: string;
  requestType: 'result_upload' | 'timetable_change' | 'student_removal';
  requestedBy: {
    _id: string;
    role: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'denied';
  data: any;
  createdAt: string;
}

/**
 * Populated user reference returned alongside audit logs. The backend joins
 * `email firstName lastName role` so the dashboard can show "Mrs. Johnson"
 * instead of a raw ObjectId.
 */
export interface AuditLogActor {
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface AuditLog {
  _id: string;
  /** Either an ObjectId string (unpopulated) or the populated actor doc. */
  userId?: string | AuditLogActor | null;
  action: string;
  role: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  metadata?: any;
  /** Audit log uses `timestamp` (not `createdAt`). */
  timestamp: string;
}

/**
 * Shape returned by GET /super-admin/audit-logs.
 *
 * Note this is *not* the generic PaginatedResponse — the backend returns
 * `logs` instead of `items` for this specific endpoint.
 */
export interface AuditLogPage {
  logs: AuditLog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
}

/**
 * Shape returned by GET /super-admin/analytics/overview — the four headline
 * numbers for the dashboard StatsCards. Each stat carries its current value
 * plus a % delta vs the prior 30-day window so the UI can render a trend
 * indicator without extra computation.
 */
export interface DashboardOverview {
  totalStudents: { value: number; changePercent: number };
  activeTeachers: { value: number; changePercent: number };
  monthlyRevenue: { value: number; currency: string; changePercent: number };
  pendingApprovals: { value: number; changePercent: number };
  generated_at: string;
}

export interface DashboardAnalytics {
  period: string;
  realtime: {
    activeSessions: number;
    activeUsers: number;
    systemLoad: any;
  };
  users: {
    totalLogins: number;
    uniqueUsers: number;
    avgSessionTime: number;
    loginTrend: any[];
  };
  system: {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
  };
  security: {
    failedLogins: number;
    blockedIPs: number;
    suspiciousActivities: number;
    threatLevel: string;
  };
}

// ============================================================================
// TIMETABLE MANAGEMENT TYPES
// ============================================================================

/** One period in a class timetable (as returned by the SA list endpoint). */
export interface SATimetableEntry {
  _id: string;
  className: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  room: string | null;
  academicSession: string;
  term: 'First' | 'Second' | 'Third';
}

export interface TimetableSummary {
  totalHours: number;
  totalPeriods: number;
  totalFreePeriods: number;
  freePeriodsByDay: Record<string, number>;
  hoursPerTeacher: Array<{ teacher: string; hours: number }>;
}

export interface TimetableListResponse {
  className: string;
  entries: SATimetableEntry[];
  summary: TimetableSummary;
}

export interface TeacherOption {
  _id: string;
  name: string;
}

/** Payload for creating/updating a timetable period. */
export interface TimetableEntryInput {
  className: string;
  subject: string;
  teacherId: string;
  day: SATimetableEntry['day'];
  startTime: string;
  endTime: string;
  room?: string;
  academicSession: string;
  term: SATimetableEntry['term'];
}

// ============================================================================
// USER ACTIVITY & LOGIN INSIGHTS TYPES
// ============================================================================

/** Normalised device descriptor parsed from the User-Agent at login. */
export interface SessionDevice {
  type?: string; // desktop | mobile | tablet | bot
  browser?: string;
  os?: string;
}

/** One row in the "who logged in" table (GET /analytics/users/activity). */
export interface UserActivityRow {
  userId: string;
  name: string;
  email: string;
  role: string;
  isActiveUser: boolean;
  loginCount: number;
  lastLogin: string | null;
  totalDurationSeconds: number;
  avgDurationSeconds: number;
  totalTimeHuman: string;
  avgSessionHuman: string;
  isOnline: boolean;
  activeSessions: number;
  devices: string[];
  uniqueIps: number;
}

export interface UserActivityResponse {
  users: UserActivityRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  parameters: { dateRange: number; sortBy: string; order: string };
  generated_at: string;
}

export type UserActivitySortField =
  | 'lastLogin'
  | 'loginCount'
  | 'totalTime'
  | 'avgSession'
  | 'name';

export interface UserActivityParams {
  dateRange?: number;
  page?: number;
  limit?: number;
  sortBy?: UserActivitySortField;
  order?: 'asc' | 'desc';
  role?: string;
  search?: string;
  onlineOnly?: boolean;
}

/** One live session (GET /analytics/live). */
export interface LiveSessionRow {
  sessionId: string;
  userId: string | null;
  name: string;
  email: string | null;
  role: string;
  loginAt: string;
  lastActivity: string;
  onlineForSeconds: number;
  onlineForHuman: string;
  ip?: string;
  device: SessionDevice;
}

export interface LiveSessionsResponse {
  onlineUsers: number;
  activeSessions: number;
  byRole: Record<string, number>;
  sessions: LiveSessionRow[];
  generated_at: string;
}

/** One entry in a user's login timeline (GET /analytics/users/:id/sessions). */
export interface UserSessionItem {
  sessionId: string;
  loginAt: string;
  endedAt: string | null;
  isOnline: boolean;
  status: string; // 'active' | 'logout' | 'expired' | 'forced' | 'ended'
  durationSeconds: number;
  durationHuman: string;
  lastActivity: string;
  ip?: string;
  device: SessionDevice;
}

export interface UserSessionsResponse {
  user: {
    userId: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  summary: {
    totalSessions: number;
    totalTimeSeconds: number;
    totalTimeHuman: string;
    avgSessionSeconds: number;
    avgSessionHuman: string;
    longestSessionSeconds: number;
    longestSessionHuman: string;
    uniqueDevices: string[];
    uniqueIps: number;
  };
  sessions: UserSessionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  parameters: { dateRange: number };
  generated_at: string;
}

// ============================================================================
// PAYMENT VIEW TYPES (SuperAdmin reporting surface)
// ============================================================================

export interface SuperAdminPaymentStudentRef {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  admissionNumber?: string;
  className?: string;
  guardianName?: string;
}

export interface SuperAdminPaymentRow {
  _id: string;
  student: SuperAdminPaymentStudentRef | null;
  amount: number;
  paymentType: string;
  description: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'online';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  /** UI-friendly status label ("Success" | "Pending" | "Failed" | "Refunded"). */
  uiStatus: 'Success' | 'Pending' | 'Failed' | 'Refunded';
  academicYear?: string;
  term?: string;
  receiptNumber: string | null;
  transactionId: string | null;
  paidAt?: string;
  createdAt: string;
}

export interface PaymentOverview {
  totalRevenue: { value: number; changePercent: number };
  todaysPayment: { value: number; changePercent: number };
  totalOutstanding: { value: number; changePercent: number };
  failedCount: { value: number; changePercent: number };
  context: { academicYear: string | null; term: string | null };
}

export interface SuperAdminStudentPaymentRow {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  admissionNumber?: string;
  className?: string;
  balance: number;
  pendingCount: number;
  status: string;
  referenceNumber: string | null;
}

export interface StudentPaymentDetail {
  student: SuperAdminPaymentStudentRef;
  dueItems: Array<{
    _id: string;
    item: string;
    amount: number;
    status: string;
    dueDate?: string;
  }>;
  history: Array<{
    _id: string;
    item: string;
    amount: number;
    status: string;
    uiStatus: SuperAdminPaymentRow['uiStatus'];
    referenceNumber: string | null;
    paymentMethod: SuperAdminPaymentRow['paymentMethod'];
    paidAt?: string;
    createdAt: string;
  }>;
}

// ============================================================================
// RESULT MANAGEMENT TYPES
// ============================================================================

/** Single row in the SuperAdmin Result Management table. */
export interface SuperAdminResultRow {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
  };
  class: string;
  academicYear: string;
  term: string;
  /** Average score 0-100 across all subjects, rounded to 1 dp. */
  totalScore: number | null;
  position: number | null;
  positionLabel: string;
  classSize: number | null;
  status: 'approved' | 'published';
  updatedAt: string;
}

/** Full subject entry returned in a student's result detail. */
export interface FullSubjectResult {
  name: string;
  scores: { firstCA: number; secondCA: number; exam: number; total: number };
  grade: string;
  remark?: string;
}

/** Full result document returned by GET /super-admin/results/student/:id */
export interface StudentFullResult {
  _id: string;
  academicYear: string;
  term: string;
  class: string;
  status: 'approved' | 'published';
  subjects: FullSubjectResult[];
  summary: {
    totalScore: number;
    averageScore: number;
    position: number | null;
    classSize: number | null;
    principalComment: string;
    classTeacherComment: string;
  };
  updatedAt: string;
}

/** Response shape for GET /super-admin/results/student/:studentId */
export interface StudentResultsDetailResponse {
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    admissionNumber: string;
    className: string;
    isActive: boolean;
  };
  results: StudentFullResult[];
}

export interface SuperAdminResultsResponse {
  results: SuperAdminResultRow[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
  facets: { classes: string[] };
}

export interface ResultsOverview {
  passRate: { value: number; changePercent: number };
  failRate: { value: number; changePercent: number };
  newThisMonth: { value: number; changePercent: number };
  context: {
    academicYear: string | null;
    term: string | null;
    className: string | null;
    totalResults: number;
  };
}

export interface SubjectInput {
  name: string;
  scores: {
    firstCA: number;
    secondCA: number;
    exam: number;
  };
}

export interface CreateResultPayload {
  studentId: string;
  academicYear: string;
  term: 'First Term' | 'Second Term' | 'Third Term';
  class: string;
  subjects: SubjectInput[];
}

// ============================================================================
// EXAM CONTENT TYPES
// ============================================================================

export interface ExamFolder {
  _id: string;
  subject: string;
  description?: string;
  questionCount: number;
  lastModified: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ExamFileUploader {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export interface ExamFile {
  _id: string;
  folder: string;
  fileName: string;
  originalName?: string;
  fileType: 'PDF' | 'Word' | 'Excel' | 'CSV' | 'Other';
  mimeType?: string;
  source: string;
  cloudinaryPublicId?: string;
  sizeBytes?: number;
  uploadedBy?: string | ExamFileUploader | null;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Create a new student
 */
export const createStudent = async (
  data: CreateStudentData
): Promise<ApiResponse<CreateStudentResponse>> => {
  return apiClient.post(API.SUPER_ADMIN.USERS.CREATE_STUDENT, data);
};

/**
 * Create a new admin/teacher
 */
export const createStaff = async (
  data: CreateStaffData
): Promise<ApiResponse<any>> => {
  return apiClient.post(API.SUPER_ADMIN.USERS.CREATE_ADMIN, data);
};

/**
 * Reset user password
 */
export const resetUserPassword = async (
  userId: string
): Promise<ApiResponse<{ userId: string; tempPassword: string; email: string }>> => {
  return apiClient.put(API.SUPER_ADMIN.USERS.RESET_PASSWORD(userId));
};

/**
 * Force logout a user
 */
export const forceLogoutUser = async (
  userId: string
): Promise<ApiResponse> => {
  return apiClient.post(API.SUPER_ADMIN.USERS.FORCE_LOGOUT(userId));
};

/**
 * Permanently remove a user — soft-delete that flips `isDeleted=true`,
 * mangles the email, releases the admission number, and ends sessions.
 * Deleted users no longer appear in `getStudents` / `getStudent`.
 */
export const removeUser = async (
  userId: string
): Promise<ApiResponse> => {
  return apiClient.delete(API.SUPER_ADMIN.USERS.REMOVE(userId));
};

/**
 * Reversibly disable a user — flips `isActive=false`, kills sessions, but
 * leaves the email and admission number alone. Call `reactivateUser` to
 * undo. Not allowed on deleted users.
 */
export const deactivateUser = async (
  userId: string
): Promise<ApiResponse<{ userId: string; isActive: false }>> => {
  return apiClient.put(API.SUPER_ADMIN.USERS.DEACTIVATE(userId));
};

/**
 * Re-enable a previously deactivated user — flips `isActive=true`. Won't
 * resurrect a deleted user.
 */
export const reactivateUser = async (
  userId: string
): Promise<ApiResponse<{ userId: string; isActive: true }>> => {
  return apiClient.put(API.SUPER_ADMIN.USERS.REACTIVATE(userId));
};

// ============================================================================
// STUDENT MANAGEMENT
// ============================================================================

/**
 * Get all students with pagination
 */
export const getStudents = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  className?: string;
  status?: 'active' | 'inactive';
}): Promise<ApiResponse<PaginatedResponse<Student>>> => {
  return apiClient.get(API.SUPER_ADMIN.STUDENTS.GET_ALL, params);
};

/**
 * Get single student by ID
 */
export const getStudent = async (
  studentId: string
): Promise<ApiResponse<Student>> => {
  return apiClient.get(API.SUPER_ADMIN.STUDENTS.GET_ONE(studentId));
};

/**
 * Update student details
 */
export const updateStudent = async (
  studentId: string,
  data: Partial<Student>
): Promise<ApiResponse<Student>> => {
  return apiClient.put(API.SUPER_ADMIN.STUDENTS.UPDATE(studentId), data);
};

// ============================================================================
// STAFF MANAGEMENT
// ============================================================================

/**
 * List staff (users with role: admin). Same query params as getStudents.
 */
export const getAllStaff = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: 'active' | 'inactive';
}): Promise<ApiResponse<PaginatedResponse<Staff>>> => {
  return apiClient.get(API.SUPER_ADMIN.STAFF.GET_ALL, params);
};

/**
 * Single staff doc. Backend wraps it as `{ staff }` — caller should probe
 * `res.data.staff ?? res.data` when consuming.
 */
export const getStaff = async (
  staffId: string
): Promise<ApiResponse<Staff>> => {
  return apiClient.get(API.SUPER_ADMIN.STAFF.GET_ONE(staffId));
};

// ============================================================================
// ADMISSION POOL
// ============================================================================

/**
 * Get admission pool status
 */
export const getAdmissionPoolStatus = async (): Promise<ApiResponse<AdmissionPoolStatus>> => {
  return apiClient.get(API.SUPER_ADMIN.ADMISSION.STATUS);
};

/**
 * Generate new admission numbers
 */
export const generateAdmissionPool = async (
  year: number,
  count: number
): Promise<ApiResponse> => {
  return apiClient.post(API.SUPER_ADMIN.ADMISSION.GENERATE, { year, count });
};

// ============================================================================
// APPROVALS
// ============================================================================

/**
 * Get pending approvals
 */
export const getPendingApprovals = async (): Promise<ApiResponse<PendingApproval[]>> => {
  return apiClient.get(API.SUPER_ADMIN.APPROVALS.PENDING);
};

/**
 * Approve a request
 */
export const approveRequest = async (
  requestId: string,
  notes?: string
): Promise<ApiResponse> => {
  return apiClient.put(API.SUPER_ADMIN.APPROVALS.APPROVE(requestId), { notes });
};

/**
 * Deny a request
 */
export const denyRequest = async (
  requestId: string,
  reason: string
): Promise<ApiResponse> => {
  return apiClient.put(API.SUPER_ADMIN.APPROVALS.DENY(requestId), { reason });
};

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Get notification analytics
 */
export const getNotificationAnalytics = async (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}): Promise<ApiResponse<any>> => {
  return apiClient.get(API.SUPER_ADMIN.NOTIFICATIONS.ANALYTICS, params);
};

/**
 * Send broadcast notification
 */
export const sendBroadcastNotification = async (data: {
  title: string;
  message: string;
  targetRoles: string[];
  priority?: 'low' | 'medium' | 'high';
  channels?: string[];
}): Promise<ApiResponse> => {
  return apiClient.post(API.SUPER_ADMIN.NOTIFICATIONS.BROADCAST, data);
};

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get dashboard analytics
 */
export const getDashboardAnalytics = async (
  period?: string
): Promise<ApiResponse<DashboardAnalytics>> => {
  return apiClient.get(API.SUPER_ADMIN.ANALYTICS.DASHBOARD, { period });
};

/**
 * Get aggregated overview numbers for the StatsCards grid (students, teachers,
 * monthly revenue, pending approvals). Cheaper than calling four endpoints.
 */
export const getDashboardOverview = async (): Promise<
  ApiResponse<DashboardOverview>
> => {
  return apiClient.get(API.SUPER_ADMIN.ANALYTICS.OVERVIEW);
};

/**
 * Get activity trends
 */
export const getActivityTrends = async (): Promise<ApiResponse<any>> => {
  return apiClient.get(API.SUPER_ADMIN.ANALYTICS.TRENDS);
};

// ─── User Activity & Login Insights ──────────────────────────────────────────

/**
 * The headline "who logged in" table — one row per user active in the window,
 * with login count, last login, time online, device, and online-now status.
 */
export const getUserActivity = async (
  params?: UserActivityParams
): Promise<ApiResponse<UserActivityResponse>> => {
  return apiClient.get(API.SUPER_ADMIN.ANALYTICS.USER_ACTIVITY, params);
};

/** Who's online right now — live sessions + how long each has been on. */
export const getLiveSessions = async (): Promise<
  ApiResponse<LiveSessionsResponse>
> => {
  return apiClient.get(API.SUPER_ADMIN.ANALYTICS.LIVE);
};

/** A single user's login timeline + rolled-up session summary. */
export const getUserSessions = async (
  userId: string,
  params?: { dateRange?: number; page?: number; limit?: number }
): Promise<ApiResponse<UserSessionsResponse>> => {
  return apiClient.get(API.SUPER_ADMIN.ANALYTICS.USER_SESSIONS(userId), params);
};

// ============================================================================
// TIMETABLE MANAGEMENT
// ============================================================================

/** Entries + summary for one class's timetable. `className` is required. */
export const listTimetable = async (params: {
  className: string;
  academicSession?: string;
  term?: string;
}): Promise<ApiResponse<TimetableListResponse>> => {
  return apiClient.get(API.SUPER_ADMIN.TIMETABLE.LIST, params);
};

/** Create a timetable period. */
export const createTimetableEntry = async (
  data: TimetableEntryInput
): Promise<ApiResponse<{ entry: SATimetableEntry }>> => {
  return apiClient.post(API.SUPER_ADMIN.TIMETABLE.CREATE, data);
};

/** Update a timetable period. */
export const updateTimetableEntry = async (
  id: string,
  data: TimetableEntryInput
): Promise<ApiResponse<{ entry: SATimetableEntry }>> => {
  return apiClient.put(API.SUPER_ADMIN.TIMETABLE.UPDATE(id), data);
};

/** Soft-delete a timetable period. */
export const deleteTimetableEntry = async (
  id: string
): Promise<ApiResponse<{ timetableId: string }>> => {
  return apiClient.delete(API.SUPER_ADMIN.TIMETABLE.DELETE(id));
};

/** Class names the SA can build timetables for (classes students belong to). */
export const getTimetableClassOptions = async (): Promise<
  ApiResponse<{ classes: string[] }>
> => {
  return apiClient.get(API.SUPER_ADMIN.TIMETABLE.CLASSES);
};

/** Active teachers for the entry-form dropdown. */
export const getTimetableTeachers = async (): Promise<
  ApiResponse<{ teachers: TeacherOption[] }>
> => {
  return apiClient.get(API.SUPER_ADMIN.TIMETABLE.TEACHERS);
};

// ============================================================================
// MONITORING
// ============================================================================

// ============================================================================
// PAYMENT VIEWS (SuperAdmin reporting)
// ============================================================================

/** Paginated payment list — drives PaymentManagement history table + Receipts page. */
export const listSuperAdminPayments = async (params?: {
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentType?: string;
  academicYear?: string;
  term?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<
  ApiResponse<{
    payments: SuperAdminPaymentRow[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasMore: boolean;
    };
  }>
> => {
  return apiClient.get(API.SUPER_ADMIN.PAYMENT_VIEWS.LIST, params);
};

/** Headline stat cards for the PaymentManagement dashboard. */
export const getPaymentOverview = async (params?: {
  academicYear?: string;
  term?: string;
}): Promise<ApiResponse<PaymentOverview>> => {
  return apiClient.get(API.SUPER_ADMIN.PAYMENT_VIEWS.OVERVIEW, params);
};

/** Per-student rolled-up balance + due status (AllStudentsPayment view). */
export const listStudentPayments = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<
  ApiResponse<{
    students: SuperAdminStudentPaymentRow[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasMore: boolean;
    };
  }>
> => {
  return apiClient.get(API.SUPER_ADMIN.PAYMENT_VIEWS.STUDENTS, params);
};

/** Single student's due items + full history (StudentPaymentDetail view). */
export const getStudentPaymentDetail = async (
  studentId: string
): Promise<ApiResponse<StudentPaymentDetail>> => {
  return apiClient.get(API.SUPER_ADMIN.PAYMENT_VIEWS.STUDENT_DETAIL(studentId));
};

// ============================================================================
// RESULT MANAGEMENT
// ============================================================================

/**
 * Paginated list of student results for the SuperAdmin Result Management
 * table. All filters are optional; defaults return the most recent term's
 * published / approved results across every class.
 */
export const listSuperAdminResults = async (params?: {
  academicYear?: string;
  term?: string;
  className?: string;
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<SuperAdminResultsResponse>> => {
  return apiClient.get(API.SUPER_ADMIN.RESULTS.LIST, params);
};

/** Create a result directly as approved (SuperAdmin direct entry, skips teacher workflow). */
export const createResult = async (
  payload: CreateResultPayload
): Promise<ApiResponse<{ result: any }>> => {
  return apiClient.post(API.SUPER_ADMIN.RESULTS.CREATE, payload);
};

/** Fetch all results for a specific student (all terms/years, full subjects). */
export const getStudentAllResults = async (
  studentId: string
): Promise<ApiResponse<StudentResultsDetailResponse>> => {
  return apiClient.get(API.SUPER_ADMIN.RESULTS.STUDENT(studentId));
};

/** Update an existing result's subjects and/or comments. */
export const updateSuperAdminResult = async (
  resultId: string,
  payload: {
    subjects: SubjectInput[];
    summary?: { principalComment?: string; classTeacherComment?: string };
  }
): Promise<ApiResponse<{ result: any }>> => {
  return apiClient.put(API.SUPER_ADMIN.RESULTS.UPDATE(resultId), payload);
};

/** Headline stats for the page's three cards. */
export const getResultsOverview = async (params?: {
  academicYear?: string;
  term?: string;
  className?: string;
}): Promise<ApiResponse<ResultsOverview>> => {
  return apiClient.get(API.SUPER_ADMIN.RESULTS.OVERVIEW, params);
};

// ─── Subject Analysis ────────────────────────────────────────────────────────

export interface SubjectAnalysisEntry {
  name: string;
  studentCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  gradeDistribution: Record<string, number>;
}

export interface SubjectAnalysisResponse {
  subjects: SubjectAnalysisEntry[];
  context: { academicYear: string | null; term: string | null; className: string | null };
}

export const getSubjectAnalysis = async (params?: {
  academicYear?: string;
  term?: string;
  className?: string;
}): Promise<ApiResponse<SubjectAnalysisResponse>> => {
  return apiClient.get(API.SUPER_ADMIN.RESULTS.SUBJECT_ANALYSIS, params);
};

// ─── Broadsheet ──────────────────────────────────────────────────────────────

export interface BroadsheetScores {
  firstCA: number;
  secondCA: number;
  exam: number;
  total: number;
  grade: string;
}

export interface BroadsheetStudent {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  scores: Record<string, BroadsheetScores>;
  averageScore: number;
  position: number;
}

export interface BroadsheetResponse {
  class: string;
  academicYear: string;
  term: string;
  subjects: string[];
  students: BroadsheetStudent[];
  classSize: number;
}

export const getBroadsheet = async (params: {
  academicYear: string;
  term: string;
  class: string;
}): Promise<ApiResponse<BroadsheetResponse>> => {
  return apiClient.get(API.SUPER_ADMIN.RESULTS.BROADSHEET, params);
};

// ============================================================================
// EXAM FOLDERS + FILES
// ============================================================================

/** List every exam folder with file counts + last-modified timestamps. */
export const listExamFolders = async (): Promise<
  ApiResponse<{ folders: ExamFolder[] }>
> => {
  return apiClient.get(API.SUPER_ADMIN.EXAMS.FOLDERS);
};

/** Create a new exam folder (subject). */
export const createExamFolder = async (
  subject: string,
  description?: string
): Promise<ApiResponse<{ folder: ExamFolder }>> => {
  return apiClient.post(API.SUPER_ADMIN.EXAMS.FOLDERS, {
    subject,
    description,
  });
};

/** Rename a folder (and/or update its description). */
export const updateExamFolder = async (
  folderId: string,
  updates: { subject?: string; description?: string }
): Promise<ApiResponse<{ folder: ExamFolder }>> => {
  return apiClient.patch(API.SUPER_ADMIN.EXAMS.FOLDER(folderId), updates);
};

/** Delete a folder and all of its files (cloudinary cleanup happens server-side). */
export const deleteExamFolder = async (
  folderId: string
): Promise<ApiResponse<{ folderId: string; fileCount: number }>> => {
  return apiClient.delete(API.SUPER_ADMIN.EXAMS.FOLDER(folderId));
};

/** List the files inside a folder (with populated uploadedBy). */
export const listExamFiles = async (
  folderId: string
): Promise<ApiResponse<{ folder: ExamFolder; files: ExamFile[] }>> => {
  return apiClient.get(API.SUPER_ADMIN.EXAMS.FILES_IN(folderId));
};

/**
 * Upload one or more files into a folder.
 *
 * The browser-native File objects are wrapped in a FormData (field name
 * "files"). Cloudinary handles the actual byte stream on the backend.
 */
export const uploadExamFiles = async (
  folderId: string,
  files: File[]
): Promise<ApiResponse<{ files: ExamFile[] }>> => {
  const form = new FormData();
  for (const file of files) {
    form.append('files', file);
  }
  return apiClient.upload(API.SUPER_ADMIN.EXAMS.FILES_IN(folderId), form);
};

/** Rename a file's display name (Cloudinary asset is unchanged). */
export const renameExamFile = async (
  fileId: string,
  fileName: string
): Promise<ApiResponse<{ file: ExamFile }>> => {
  return apiClient.patch(API.SUPER_ADMIN.EXAMS.FILE(fileId), { fileName });
};

/** Delete a single file (Cloudinary + DB). */
export const deleteExamFile = async (
  fileId: string
): Promise<ApiResponse<{ fileId: string }>> => {
  return apiClient.delete(API.SUPER_ADMIN.EXAMS.FILE(fileId));
};

/**
 * Get audit logs
 */
export const getAuditLogs = async (params?: {
  page?: number;
  limit?: number;
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<AuditLogPage>> => {
  return apiClient.get(API.SUPER_ADMIN.MONITORING.AUDIT_LOGS, params);
};

// ============================================================================
// EXPORT ALL
// ============================================================================

const superAdminService = {
  // User Management
  createStudent,
  createStaff,
  resetUserPassword,
  forceLogoutUser,
  removeUser,
  deactivateUser,
  reactivateUser,
  
  // Student Management
  getStudents,
  getStudent,
  updateStudent,

  // Staff Management
  getAllStaff,
  getStaff,
  
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
  getDashboardOverview,
  getActivityTrends,
  getUserActivity,
  getLiveSessions,
  getUserSessions,

  // Timetable
  listTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getTimetableClassOptions,
  getTimetableTeachers,

  // Monitoring
  getAuditLogs,
};

export default superAdminService;
