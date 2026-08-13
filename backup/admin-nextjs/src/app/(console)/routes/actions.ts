"use server";

import { revalidatePath } from "next/cache";

import { apiCall } from "../../../lib/api";

type Direction = "inbound" | "outbound";

export async function createRoute(formData: FormData): Promise<string | null> {
  const name = String(formData.get("name") ?? "").trim();
  const direction = String(formData.get("direction") ?? "inbound") as Direction;

  if (!name) return "Give the route a name.";

  try {
    await apiCall((api) =>
      api.POST("/admin/routes", { body: { name, direction, polyline: null, is_active: true } }),
    );
  } catch {
    // The likely cause by far: a route with this name already runs in this
    // direction. The pair is unique because an out-and-back share a name.
    return `Could not create it — is there already an ${direction} route called "${name}"?`;
  }

  revalidatePath("/routes");
  return null;
}

/**
 * Retire a route, or bring it back.
 *
 * There is no delete. `trips` reference routes with `ON DELETE RESTRICT` and
 * every completed trip is history someone may report on, so retiring is the
 * only safe removal — it stops appearing to helpers and students while the past
 * still resolves.
 */
export async function setRouteActive(routeId: string, isActive: boolean): Promise<void> {
  await apiCall((api) =>
    api.PATCH("/admin/routes/{route_id}", {
      params: { path: { route_id: routeId } },
      body: { is_active: isActive },
    }),
  );
  revalidatePath("/routes");
}

/**
 * Set a route's complete ordered stop list.
 *
 * The whole list goes at once because sequence numbers are unique per route, so
 * any incremental move collides with itself partway — shifting stop 3 into
 * position 2 needs position 2 free, which it is not until stop 2 has moved. The
 * server numbers them from list position, so ordering *is* the order.
 */
export async function saveRouteStops(
  routeId: string,
  stops: { stop_id: string; scheduled_offset_min: number | null }[],
): Promise<string | null> {
  if (stops.length === 0) {
    // The API requires at least one. Saying so here avoids a 422 that reads
    // like a bug when it is really "a route with no stops is not a route".
    return "A route needs at least one stop.";
  }

  try {
    await apiCall((api) =>
      api.PUT("/admin/routes/{route_id}/stops", {
        params: { path: { route_id: routeId } },
        body: { stops },
      }),
    );
  } catch {
    return "Could not save the stop order.";
  }

  revalidatePath(`/routes/${routeId}`);
  revalidatePath("/routes");
  return null;
}
