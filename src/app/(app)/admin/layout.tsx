import type { Metadata } from "next";

import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminTabs } from "@/components/admin/admin-tabs";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();

  const openReports = await prisma.report.count({ where: { status: "OPEN" } });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="font-heading text-3xl tracking-wide">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as @{user.username} · {user.role.toLowerCase()}
        </p>
      </div>
      <AdminTabs openReports={openReports} />
      {children}
    </div>
  );
}
