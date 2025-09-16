import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import React, { type ComponentType } from "react";
import type { AdminSectionSlug } from "@/Constants";

const adminSections: Record<AdminSectionSlug, ComponentType<any>> = {
  home: dynamic(() => import("./sections/Home")),
  "student-management": dynamic(() => import("./sections/StudentManagement")),
  "exam-questions": dynamic(() => import("./sections/ExamQuestions")),
  "result-management": dynamic(() => import("./sections/ResultManagement")),
  "content-upload": dynamic(() => import("./sections/ContentUpload")),
  "teachers-portal": dynamic(() => import("./sections/TeachersPortal")),
  "payment-management": dynamic(() => import("./sections/PaymentManagement")),
  analyticsandinsights: dynamic(() => import("./sections/Analytics&Insights")),
};

type Props = { params: { section: string } };

export default function StudentSectionPage({ params }: Props) {
  const slug = params.section as AdminSectionSlug;
  const SectionComponent = adminSections[slug];

  if (!SectionComponent) {
    notFound();
    return null;
  }

  return <SectionComponent />;
}
