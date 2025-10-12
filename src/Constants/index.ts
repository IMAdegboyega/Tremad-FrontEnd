

export const StudentNav = [
    { name: "Home", slug: "home", icon: "/icon/home.svg", url: "/home", showInSidebar: true },
    { name: "Subject Management", slug: "subject-management", icon: "/icon/subjectmanagement.svg", url: "/subject-management", showInSidebar: true },
    { name: "Time Table", slug: "time-table", icon: "/icon/timetable.svg", url: "/time-table", showInSidebar: true },
    { name: "Results", slug: "results", icon: "/icon/results.svg", url: "/results", showInSidebar: true },
    { name: "Payment", slug: "payment", icon: "/icon/payments.svg", url: "/payment", showInSidebar: true },
    { name: "Profile", slug: "profile", icon: "/icon/profile.svg", url: "/profile", showInSidebar: true },
    { name: "Notification", slug: "notification", icon: "/icon/notification.svg", url: "/notification", showInSidebar: false },
] as const;

export type StudentSectionSlug = typeof StudentNav[number]["slug"];

export const AdminNav = [
  { name: "Home", slug: "home", icon: "/icon/home.svg", url: "/Admin/home" },
  { name: "Student Management", slug: "student-management", icon: "/icon/studentmanagement.svg", url: "/Admin/student-management" },
  { name: "Exam Questions", slug: "exam-questions", icon: "/icon/examquestions.svg", url: "/Admin/exam-questions" },
  { name: "Result Management", slug: "result-management", icon: "/icon/resultmanagement.svg", url: "/Admin/result-management" },
  { name: "Content Upload", slug: "content-upload", icon: "/icon/contentupload.svg", url: "/Admin/content-upload" },
  { name: "Teachers Portal", slug:"teachers-portal", icon: "/icon/teachersportal.svg", url: "/Admin/teachers-portal" },
  { name: "Payment Management", slug: "payment-management", icon: "/icon/paymentmanagement.svg", url: "/Admin/payment-management" },
  { name: "Analytics & Insights", slug: "analyticsandinsights", icon: "/icon/analytics&insights.svg", url: "/Admin/analytics-insights" },
] as const;

export type AdminSectionSlug = typeof AdminNav[number]["slug"];
 
