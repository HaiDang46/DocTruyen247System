"use client";

import dynamic from "next/dynamic";

const AdminStoryManager = dynamic(
  () => import("@/components/admin/admin-story-manager").then((mod) => mod.AdminStoryManager),
  { ssr: false }
);

export default function AdminDashboardPage() {
  return <AdminStoryManager />;
}


