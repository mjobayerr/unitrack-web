"use server";

import { revalidatePath } from "next/cache";

import { ApiError, apiCall } from "../../../lib/api";

/**
 * The stop registry — the shared vocabulary every route is built from.
 *
 * Stops exist independently of routes on purpose: "Farmgate" is one place, and
 * six routes passing through it must agree on where it is. Moving it here fixes
 * all six at once, which is why editing is a rename-and-move rather than a
 * per-route override.
 */

function parseCoordinate(value: FormDataEntryValue | null, limit: number): number | null {
  const parsed = Number(String(value ?? "").trim());
  if (!Number.isFinite(parsed) || Math.abs(parsed) > limit) return null;
  return parsed;
}

export async function createStop(formData: FormData): Promise<string | null> {
  const name = String(formData.get("name") ?? "").trim();
  const lat = parseCoordinate(formData.get("lat"), 90);
  const lng = parseCoordinate(formData.get("lng"), 180);

  if (!name) return "Give the stop a name.";
  if (lat === null) return "Latitude must be between -90 and 90.";
  if (lng === null) return "Longitude must be between -180 and 180.";

  try {
    await apiCall((api) => api.POST("/admin/stops", { body: { name, lat, lng } }));
  } catch {
    return "Could not create the stop.";
  }

  revalidatePath("/stops");
  return null;
}

export async function updateStop(
  stopId: string,
  values: { name: string; lat: string; lng: string },
): Promise<string | null> {
  const name = values.name.trim();
  const lat = parseCoordinate(values.lat, 90);
  const lng = parseCoordinate(values.lng, 180);

  if (!name) return "Give the stop a name.";
  if (lat === null) return "Latitude must be between -90 and 90.";
  if (lng === null) return "Longitude must be between -180 and 180.";

  try {
    await apiCall((api) =>
      api.PATCH("/admin/stops/{stop_id}", {
        params: { path: { stop_id: stopId } },
        body: { name, lat, lng },
      }),
    );
  } catch {
    return "Could not update the stop.";
  }

  revalidatePath("/stops");
  revalidatePath("/routes");
  return null;
}

/**
 * Delete a stop no route uses.
 *
 * The API refuses one that is in use and says how many routes are in the way,
 * so that message is surfaced verbatim rather than replaced with something
 * vaguer. An operator told "used by 2 route(s)" knows what to do next.
 */
export async function deleteStop(stopId: string): Promise<string | null> {
  try {
    await apiCall((api) =>
      api.DELETE("/admin/stops/{stop_id}", { params: { path: { stop_id: stopId } } }),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      const detail = (error.detail as { detail?: string })?.detail;
      return detail ?? "This stop is still used by a route.";
    }
    return "Could not delete the stop.";
  }

  revalidatePath("/stops");
  return null;
}
