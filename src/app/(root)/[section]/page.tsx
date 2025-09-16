import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import React, { type ComponentType } from "react";
import type { StudentSectionSlug } from "@/Constants";

const studentSections: Record<StudentSectionSlug, ComponentType<any>> = {
  home: dynamic(() => import("./sections/Home")),
  "subject-management": dynamic(() => import("./sections/SubjectManagement")),
  "time-table": dynamic(() => import("./sections/TimeTable")),
  results: dynamic(() => import("./sections/Results")),
  payment: dynamic(() => import("./sections/Payment")),
  profile: dynamic(() => import("./sections/Profile")),
};

type Props = { params: { section: string } };

export default function StudentSectionPage({ params }: Props) {
  const slug = params.section as StudentSectionSlug;
  const SectionComponent = studentSections[slug];

  if (!SectionComponent) {
    notFound();
    return null;
  }

  return <SectionComponent />;
}

