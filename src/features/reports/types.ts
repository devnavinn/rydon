import type { ReportStatus, ReportTargetType } from "@prisma/client";

export type ReportPerson = {
  id: string;
  username: string;
  fullName: string;
};

/** What the report points at, resolved for display. `null` fields mean it's since been deleted. */
export type ReportTarget =
  | { type: "USER"; user: ReportPerson & { isActive: boolean; role: string } }
  | { type: "RIDE"; ride: { id: string; title: string; status: string }; host: ReportPerson & { isActive: boolean } }
  | { type: "GROUP"; group: { id: string; name: string; rideId: string } }
  | {
      type: "MESSAGE";
      message: { id: string; body: string | null; isDeleted: boolean; createdAt: string; rideId: string };
      sender: ReportPerson & { isActive: boolean };
    }
  | { type: ReportTargetType; missing: true };

export type ReportListItem = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string;
  reason: string;
  status: ReportStatus;
  reporter: ReportPerson;
  createdAt: string;
  /** Other reports against the same target — repeat offenders float to the top of attention. */
  relatedCount: number;
};

export type ReportDetail = Omit<ReportListItem, "targetLabel"> & {
  details: string | null;
  resolutionNote: string | null;
  reviewedAt: string | null;
  reviewedBy: ReportPerson | null;
  target: ReportTarget;
  history: { id: string; reason: string; status: ReportStatus; createdAt: string }[];
};
