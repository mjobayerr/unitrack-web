"use server";

import { revalidatePath } from "next/cache";

import { apiCall } from "../../../lib/api";

/** Claim an alert, so two operators do not both respond to the same SOS. */
export async function acknowledgeAlert(alertId: string): Promise<void> {
  await apiCall((api) =>
    api.POST("/admin/alerts/{alert_id}/acknowledge", {
      params: { path: { alert_id: alertId } },
    }),
  );
  revalidatePath("/alerts");
}

/** Close an alert. The note is what someone reads months later asking what
 * actually happened, so it is required by this UI even though the API allows
 * it to be null. */
export async function resolveAlert(alertId: string, note: string): Promise<void> {
  await apiCall((api) =>
    api.POST("/admin/alerts/{alert_id}/resolve", {
      params: { path: { alert_id: alertId } },
      body: { note: note.trim() || null },
    }),
  );
  revalidatePath("/alerts");
}
