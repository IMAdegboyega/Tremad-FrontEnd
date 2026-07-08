
/**
 * Student navigation/section definitions.
 * - `showInSidebar`: controls whether the item appears in the main sidebar UI.
 *   Sections with `showInSidebar: false` are still routable/renderable via their slug
 *   (e.g., triggered by a header button), but are simply hidden from the sidebar list.
 */
export const StudentNav = [
    { name: "Home", slug: "home", icon: "/icon/home.svg", url: "/home", showInSidebar: true },
    { name: "Subject Management", slug: "subject-management", icon: "/icon/subjectmanagement.svg", url: "/subject-management", showInSidebar: true },
    { name: "Time Table", slug: "time-table", icon: "/icon/timetable.svg", url: "/time-table", showInSidebar: true },
    { name: "Results", slug: "results", icon: "/icon/results.svg", url: "/results", showInSidebar: true },
    { name: "Payment", slug: "payment", icon: "/icon/payments.svg", url: "/payment", showInSidebar: true },
    { name: "Profile", slug: "profile", icon: "/icon/profile.svg", url: "/profile", showInSidebar: true },
    { name: "Notification", slug: "notification", icon: "/icon/notification.svg", url: "/notification", showInSidebar: false }, // hidden in sidebar; opened via separate button
] as const;

/**
 * Union of all student section slugs (derived from `StudentNav`).
 */
export type StudentSectionSlug = typeof StudentNav[number]["slug"];

export const SuperAdminNav = [
  { name: "Home", slug: "home", icon: "/icon/home.svg", url: "/SuperAdmin/home", showInSidebar: true },
  { name: "Portal Login", slug:"portal-login", icon: "/icon/portallogin.svg", url: "/SuperAdmin/portal-login", showInSidebar: true },
  { name: "Student Management", slug: "student-management", icon: "/icon/studentmanagement.svg", url: "/SuperAdmin/student-management", showInSidebar: true },
  { name: "Staff Management", slug: "staff-management", icon: "/icon/staffmanagement.svg", url: "/SuperAdmin/staff-management", showInSidebar: true },
  { name: "Exam Questions", slug: "exam-questions", icon: "/icon/examquestions.svg", url: "/SuperAdmin/exam-questions", showInSidebar: true },
  { name: "Result Management", slug: "result-management", icon: "/icon/resultmanagement.svg", url: "/SuperAdmin/result-management", showInSidebar: true },
  { name: "Timetable", slug: "timetable", icon: "/icon/timetable.svg", url: "/SuperAdmin/timetable", showInSidebar: true },
  { name: "Receipts", slug: "receipts", icon: "/icon/receipts.svg", url: "/SuperAdmin/receipts", showInSidebar: true },
  { name: "Payment Management", slug: "payment-management", icon: "/icon/paymentmanagement.svg", url: "/SuperAdmin/payment-management", showInSidebar: true },
  { name: "Approvals", slug: "approvals", icon: "/icon/PendingApprovals.svg", url: "/SuperAdmin/approvals", showInSidebar: true },
  { name: "Analytics & Insights", slug: "analyticsandinsights", icon: "/icon/analytics&insights.svg", url: "/SuperAdmin/analyticsandinsights", showInSidebar: true },
  { name: "Notification", slug: "notification", icon: "/icon/notification.svg", url: "/SuperAdmin/notification", showInSidebar: false },
] as const;

export type SuperAdminSectionSlug = typeof SuperAdminNav[number]["slug"];

/**
 * Staff / teacher (role `admin`) navigation. A trimmed portal: teachers see only
 * what they need. Deliberately EXCLUDES Analytics & Insights, Approvals, and the
 * full Payment Management dashboard. "Payment" here is a read-only history view.
 * Privileged changes (student creation, timetable edits) go through the SA as
 * approval requests, tracked under "My Requests".
 */
export const AdminNav = [
  { name: "Home", slug: "home", icon: "/icon/home.svg", url: "/Admin/home", showInSidebar: true },
  { name: "Timetable", slug: "timetable", icon: "/icon/timetable.svg", url: "/Admin/timetable", showInSidebar: true },
  { name: "Student Management", slug: "student-management", icon: "/icon/studentmanagement.svg", url: "/Admin/student-management", showInSidebar: true },
  { name: "Result Management", slug: "result-management", icon: "/icon/resultmanagement.svg", url: "/Admin/result-management", showInSidebar: true },
  { name: "Payment", slug: "payment", icon: "/icon/payments.svg", url: "/Admin/payment", showInSidebar: true },
  { name: "My Requests", slug: "my-requests", icon: "/icon/PendingApprovals.svg", url: "/Admin/my-requests", showInSidebar: true },
  { name: "Profile", slug: "profile", icon: "/icon/profile.svg", url: "/Admin/profile", showInSidebar: true },
  { name: "Notification", slug: "notification", icon: "/icon/notification.svg", url: "/Admin/notification", showInSidebar: false },
] as const;

export type AdminSectionSlug = typeof AdminNav[number]["slug"];

