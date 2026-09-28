"use client";

import { useMutation } from "@tanstack/react-query";

import type { CreateReportInput } from "@/features/reports/validators";

export function useSubmitReport() {
  return useMutation({
    mutationFn: async (input: CreateReportInput) => {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Couldn't send report");
      }
    },
  });
}
