import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import React, { type ComponentType } from "react";
import type { SuperAdminSectionSlug } from "@/Constants";

const adminSections: Record<SuperAdminSectionSlug, ComponentType<any>> = {
  home: dynamic(() => import("./sections/Home")),
  "portal-login": dynamic(() => import("./sections/PortalLogin")),
  "student-management": dynamic(() => import("./sections/StudentManagement")),
  "staff-management": dynamic(() => import("./sections/StaffManagement")),
  "exam-questions": dynamic(() => import("./sections/ExamQuestions")),
  "result-management": dynamic(() => import("./sections/ResultManagement")),
  receipts: dynamic(() => import("./sections/Receipts")),
  "payment-management": dynamic(() => import("./sections/PaymentManagement")),
  analyticsandinsights: dynamic(() => import("./sections/Analytics&Insights")),
  notification: dynamic(() => import("./sections/Notification")),
};

type Props = { params: { section: string } };

export default async function SuperAdminSectionPage({ params }: Props) {
  const { section } = await params;
  const slug = params.section as SuperAdminSectionSlug;
  const SectionComponent = adminSections[slug];

  if (!SectionComponent) {
    notFound();
    return null;
  }

  return <SectionComponent />;
}
