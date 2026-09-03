import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import React, { type ComponentType } from "react";
import type { AdminSectionSlug } from "@/Constants";

const adminSections: Record<AdminSectionSlug, ComponentType<any>> = {
  home: dynamic(() => import("./sections/Home")),
  timetable: dynamic(() => import("./sections/Timetable")),
  "student-management": dynamic(() => import("./sections/StudentManagement")),
  "result-management": dynamic(() => import("./sections/ResultManagement")),
  payment: dynamic(() => import("./sections/Payment")),
  "my-requests": dynamic(() => import("./sections/MyRequests")),
  profile: dynamic(() => import("./sections/Profile")),
  notification: dynamic(() => import("./sections/Notification")),
};

type Props = { params: Promise<{ section: string }> };

export default async function AdminSectionPage({ params }: Props) {
  const { section } = await params;
  const slug = section as AdminSectionSlug;
  const SectionComponent = adminSections[slug];

  if (!SectionComponent) {
    notFound();
    return null;
  }

  return <SectionComponent />;
}
