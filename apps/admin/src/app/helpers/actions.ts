"use server";

import { revalidatePath } from "next/cache";

import { withApi } from "../../lib/api";

/**
 * Approve a pending helper.
 *
 * This is the endpoint the whole console exists for: until now approval
 * happened over curl or a seed script, which meant nobody could onboard a
 * helper without a terminal and a token.
 */
export async function approveHelper(helperId: string): Promise<void> {
  await withApi((api) =>
    api.POST("/admin/helpers/{helper_id}/approve", {
      params: { path: { helper_id: helperId } },
    }),
  );
  revalidatePath("/helpers");
}

/** Suspend a user. Takes effect on their next request, not after a cache TTL. */
export async function suspendUser(userId: string): Promise<void> {
  await withApi((api) =>
    api.POST("/admin/users/{user_id}/suspend", {
      params: { path: { user_id: userId } },
    }),
  );
  revalidatePath("/helpers");
}
