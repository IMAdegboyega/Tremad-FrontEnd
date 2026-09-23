/**
 * Tremad Schools API Configuration
 * 
 * Centralized API endpoints and configuration.
 * All API calls should use these endpoints.
 */

// Base URL from environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/**
 * API Endpoints
 */
export const API = {
  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  AUTH: {
    SUPER_ADMIN: {
      GOOGLE_LOGIN: '/auth/super-admin/google',               // POST - Google OAuth login
      LOGIN: '/auth/super-admin/login',                    // POST - Step 1: Email + Password (legacy)
      VERIFY_OTP: '/auth/super-admin/verify-otp',          // POST - Step 2: Verify OTP (legacy)
      RESEND_OTP: '/auth/super-admin/resend-otp',          // POST - Resend OTP (legacy)
      CHANGE_PASSWORD: '/auth/super-admin/change-password', // POST - Change password
      LOGOUT: '/auth/super-admin/logout',                  // POST - Logout
    },
    
    STUDENT: {
      LOGIN: '/student/auth/login',                        // POST - Login
      CHANGE_PASSWORD: '/student/auth/change-password',    // POST - Change password (first login)
      FORGOT_PASSWORD: {
        REQUEST: '/student/auth/forgot-password/request',      // POST - Request OTP
        VERIFY_OTP: '/student/auth/forgot-password/verify-otp', // POST - Verify OTP
        RESET: '/student/auth/forgot-password/reset',          // POST - Reset password
      },
      LOGOUT: '/student/auth/logout',                      // POST - Logout
    },
    
    TEACHER: {
      LOGIN: '/admin/auth/teacher/login',                  // POST - Login
      CHANGE_PASSWORD: '/admin/auth/teacher/change-password', // POST - Change password
      LOGOUT: '/admin/auth/logout',                        // POST - Logout
    },
  },

  // ============================================================================
  // SUPER ADMIN ENDPOINTS
  // ============================================================================
  SUPER_ADMIN: {
    // User Management
    USERS: {
      CREATE_STUDENT: '/super-admin/create-student',
      CREATE_ADMIN: '/super-admin/create-admin',
      RESET_PASSWORD: (userId: string) => `/super-admin/reset-password/${userId}`,
      FORCE_LOGOUT: (userId: string) => `/super-admin/force-logout/${userId}`,
      REMOVE: (userId: string) => `/super-admin/remove-user/${userId}`,
      DEACTIVATE: (userId: string) =>
        `/super-admin/users/${userId}/deactivate`,
      REACTIVATE: (userId: string) =>
        `/super-admin/users/${userId}/reactivate`,
      /** Undo a delete inside the 365-day window. POST — issues a new password. */
      RESTORE: (userId: string) => `/super-admin/users/${userId}/restore`,
      UPLOAD_AVATAR: (userId: string) => `/super-admin/users/${userId}/avatar`,
    },
    
    // Student Management
    STUDENTS: {
      GET_ALL: '/super-admin/students',
      GET_ONE: (studentId: string) => `/super-admin/students/${studentId}`,
      UPDATE: (studentId: string) => `/super-admin/students/${studentId}`,
      CHANGE_ADMISSION: (studentId: string) => `/super-admin/students/${studentId}/change-admission-number`,
      TEMP_PASSWORD: (studentId: string) =>
        `/super-admin/students/${studentId}/temp-password`,
    },

    // Admissions inbox + public content back-office
    ADMISSIONS: {
      LIST: '/super-admin/applications',
      GET_ONE: (id: string) => `/super-admin/applications/${id}`,
      UPDATE_STATUS: (id: string) => `/super-admin/applications/${id}/status`,
    },
    MESSAGES: {
      LIST: '/super-admin/messages',
      UPDATE: (id: string) => `/super-admin/messages/${id}`,
    },
    SUBJECTS: {
      LIST: '/super-admin/subjects',
      CREATE: '/super-admin/subjects',
      UPDATE: (subjectId: string) => `/super-admin/subjects/${subjectId}`,
      // DELETE archives rather than removing — past timetables and results
      // still name the subject.
      ARCHIVE: (subjectId: string) => `/super-admin/subjects/${subjectId}`,
    },
    CURRICULUM: {
      // One per grade — no session parameter.
      GET: '/super-admin/curriculum',
      SAVE: '/super-admin/curriculum',
      /** What a destructive edit would touch. Read-only. */
      IMPACT: '/super-admin/curriculum/impact',
    },
    CONTENT: {
      LIST: (kind: string) => `/super-admin/content/${kind}`,
      SAVE: (kind: string) => `/super-admin/content/${kind}`,
      DELETE: (contentId: string) => `/super-admin/content/item/${contentId}`,
    },

    // Staff Management (teachers / admins)
    STAFF: {
      GET_ALL: '/super-admin/staff',
      GET_ONE: (staffId: string) => `/super-admin/staff/${staffId}`,
      UPDATE: (staffId: string) => `/super-admin/staff/${staffId}`,
      TEMP_PASSWORD: (staffId: string) =>
        `/super-admin/staff/${staffId}/temp-password`,
      // Separate from UPDATE on purpose: assigning a class teacher releases the
      // class from whoever held it, which must not ride along on a profile save.
      CLASS_TEACHER: (staffId: string) =>
        `/super-admin/staff/${staffId}/class-teacher`,
    },

    // Result Management
    RESULTS: {
      LIST: '/super-admin/results',
      OVERVIEW: '/super-admin/results/overview',
      CREATE: '/super-admin/results',
      STUDENT: (studentId: string) => `/super-admin/results/student/${studentId}`,
      UPDATE: (resultId: string) => `/super-admin/results/${resultId}`,
      SUBJECT_ANALYSIS: '/super-admin/results/subject-analysis',
      BROADSHEET: '/super-admin/results/broadsheet',
    },

    // Payment + Receipts (read views)
    PAYMENT_VIEWS: {
      LIST: '/super-admin/payments',
      OVERVIEW: '/super-admin/payments/overview',
      STUDENTS: '/super-admin/payments/students',
      STUDENT_DETAIL: (studentId: string) =>
        `/super-admin/payments/students/${studentId}`,
    },

    // Exam papers. No folder endpoints — the Year > Class > Subject > Term
    // tree is derived from fields on the paper, so one browse call serves
    // every level.
    EXAM_PAPERS: {
      BROWSE: '/super-admin/exam-papers/browse',
      UPLOAD: '/super-admin/exam-papers',
      ONE: (paperId: string) => `/super-admin/exam-papers/${paperId}`,
    },
    
    // Admission Pool
    ADMISSION: {
      STATUS: '/super-admin/admission-pool/status',
      GENERATE: '/super-admin/generate-admission-pool',
    },
    
    // Approvals
    APPROVALS: {
      PENDING: '/super-admin/pending-approvals',
      APPROVE: (requestId: string) => `/super-admin/approve/${requestId}`,
      DENY: (requestId: string) => `/super-admin/deny/${requestId}`,
      ANALYTICS: '/super-admin/approval-analytics',
    },
    
    // Notifications
    NOTIFICATIONS: {
      ANALYTICS: '/super-admin/notification-analytics',
      BROADCAST: '/super-admin/broadcast-notification',
    },
    
    // Timetable Management
    TIMETABLE: {
      LIST: '/super-admin/timetables',                          // GET  - entries for a class (?className=&academicSession=&term=)
      CREATE: '/super-admin/timetables',                        // POST - create a period
      UPDATE: (id: string) => `/super-admin/timetables/${id}`,  // PUT  - edit a period
      DELETE: (id: string) => `/super-admin/timetables/${id}`,  // DELETE - soft-delete a period
      PUBLISH: '/super-admin/timetables/publish',               // PATCH - take a class timetable offline / online
      CLASSES: '/super-admin/timetables/classes',               // GET  - selectable class names
      TEACHERS: '/super-admin/timetables/teachers',             // GET  - selectable teachers
    },

    // Analytics
    ANALYTICS: {
      DASHBOARD: '/super-admin/analytics/dashboard',
      OVERVIEW: '/super-admin/analytics/overview',
      TRENDS: '/super-admin/analytics/trends',
      // User Activity & Login Insights
      USER_ACTIVITY: '/super-admin/analytics/users/activity',   // GET - login table (all users)
      LIVE: '/super-admin/analytics/live',                      // GET - who's online right now
      USER_SESSIONS: (userId: string) =>
        `/super-admin/analytics/users/${userId}/sessions`,       // GET - one user's login timeline
    },
    
    // Monitoring
    MONITORING: {
      AUDIT_LOGS: '/super-admin/audit-logs',
    },
  },

  // ============================================================================
  // STUDENT ENDPOINTS
  // ============================================================================
  STUDENT: {
    PROFILE: {
      GET: '/student/profile',
      UPDATE: '/student/profile',
      UPLOAD_AVATAR: '/student/profile/avatar',
      CHANGE_PASSWORD: '/student/change-password',
    },
    
    ACADEMIC: {
      RESULTS: '/student/results',
      RESULTS_DOWNLOAD: '/student/results/download',
      TIMETABLE: '/student/timetable',
    },
    
    PAYMENTS: {
      HISTORY: '/student/payment-history',
      RECEIPT: (paymentId: string) => `/student/payment/${paymentId}/receipt`,
    },
    
    NOTIFICATIONS: {
      GET_ALL: '/student/notifications',
      MARK_READ: (notificationId: string) => `/student/notifications/${notificationId}/read`,
      UNREAD_COUNT: '/student/notifications/unread-count',
    },
  },

  // ============================================================================
  // PUBLIC ENDPOINTS (no auth — prospective parents have no account)
  // ==========================================================================
  PUBLIC: {
    SETTINGS: '/public/settings',                              // GET  - fee, socials, session
    CONTENT: (kind: string) => `/public/content/${kind}`,      // GET  - books | bills | scheme
    CONTACT: '/public/contact',                                // POST - enquiry/complaint/feedback
    APPLICATIONS: '/public/applications',                      // POST - save + start payment
    APPLICATION: (ref: string) => `/public/applications/${ref}`,            // GET  - track status
    APPLICATION_VERIFY: (ref: string) => `/public/applications/${ref}/verify`, // POST - confirm payment
  },

  // ==========================================================================
  // TEACHER/ADMIN ENDPOINTS
  // ============================================================================
  TEACHER: {
    // Same handlers as the super-admin routes; the server scopes them to the
    // teacher's own classes and subjects.
    EXAM_PAPERS: {
      BROWSE: '/admin/exam-papers/browse',
      UPLOAD: '/admin/exam-papers',
      ONE: (paperId: string) => `/admin/exam-papers/${paperId}`,
    },
    PROFILE: {
      GET: '/admin/profile',
      UPDATE: '/admin/profile',
      CHANGE_PASSWORD: '/admin/change-password',
    },

    // Reads
    TIMETABLE: '/admin/timetable',                          // GET  - my teaching schedule
    ASSIGNED_STUDENTS: '/admin/assigned-students',          // GET  - students in my classes
    STUDENT_DETAIL: (studentId: string) => `/admin/students/${studentId}`,
    RESULTS_CLASS: '/admin/results/class',                  // GET  - approved class results
    PAYMENTS: '/admin/payments',                            // GET  - read-only payment history
    MY_REQUESTS: '/admin/my-requests',                      // GET  - my submitted requests

    // Notifications (the real feed — approvals write to it)
    NOTIFICATIONS: {
      LIST: '/admin/notifications',                         // GET
      UNREAD_COUNT: '/admin/notifications/unread-count',    // GET
      MARK_READ: (id: string) => `/admin/notifications/${id}/read`, // PUT
      MARK_ALL_READ: '/admin/notifications/read-all',       // PUT
    },

    // Approval-gated writes (create an ApprovalRequest → SA approves)
    REQUESTS: {
      CREATE_STUDENT: '/admin/request/create-student',      // POST - request a new student
      TIMETABLE_ENTRY: '/admin/request/timetable-entry',    // POST - create/update/delete a period
      RESULT_UPLOAD: '/admin/request/upload-result',        // POST - request result upload
      STUDENT_REMOVAL: '/admin/request/remove-student',     // POST - request removal
    },
  },
};

export default API;
