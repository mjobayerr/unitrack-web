"use server";

import { revalidatePath } from "next/cache";

import { apiCall } from "../../../lib/api";
import { bdtToPaisa } from "../../../lib/money";

/**
 * The catalogue, over HTTP instead of psql.
 *
 * Until `/admin/products` existed there was no endpoint and no seed script for
 * ticket products at all — the ones live in production were inserted by hand.
 * Changing a fare meant a shell on the box.
 *
 * Each action returns an error string rather than throwing, because these are
 * form submissions: a thrown server action shows the error boundary and loses
 * whatever the operator typed. A returned message renders next to the field.
 */

type ProductType = "single" | "bulk" | "package";

/** Put something on sale. */
export async function createProduct(formData: FormData): Promise<string | null> {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "single") as ProductType;
  const rawRides = String(formData.get("ride_count") ?? "").trim();
  const validityDays = Number(formData.get("validity_days") ?? 30);

  if (!name) return "Give the product a name.";

  const pricePaisa = bdtToPaisa(String(formData.get("price_bdt") ?? ""));
  if (pricePaisa === null) return "Price must be a number, 0 or more.";

  // Blank means unlimited rides for the validity window — a monthly pass. `0`
  // would be a ticket that can never be used, which the API rejects anyway.
  const rideCount = rawRides === "" ? null : Number(rawRides);
  if (rideCount !== null && (!Number.isInteger(rideCount) || rideCount < 1)) {
    return "Rides must be a whole number of 1 or more, or blank for unlimited.";
  }
  if (!Number.isInteger(validityDays) || validityDays < 1) {
    return "Validity must be at least 1 day.";
  }

  try {
    await apiCall((api) =>
      api.POST("/admin/products", {
        body: {
          type,
          name,
          price_paisa: pricePaisa,
          ride_count: rideCount,
          validity_days: validityDays,
          route_scope: null,
          active: true,
        },
      }),
    );
  } catch {
    return "Could not create the product.";
  }

  revalidatePath("/products");
  return null;
}

/**
 * Change a price. Does not rewrite history.
 *
 * `orders` copy the amount at purchase time, so this only affects future sales
 * — someone who paid 30.00 last week still paid 30.00.
 *
 * Only `price_paisa` is sent. The API distinguishes an unset field from an
 * explicit null, so anything omitted here is genuinely left alone; sending a
 * whole product object would clear the route scope as a side effect.
 */
export async function updatePrice(productId: string, priceBdt: string): Promise<string | null> {
  const pricePaisa = bdtToPaisa(priceBdt);
  if (pricePaisa === null) return "Price must be a number, 0 or more.";

  try {
    await apiCall((api) =>
      api.PATCH("/admin/products/{product_id}", {
        params: { path: { product_id: productId } },
        body: { price_paisa: pricePaisa },
      }),
    );
  } catch {
    return "Could not update the price.";
  }

  revalidatePath("/products");
  return null;
}

/**
 * Withdraw a product from sale, or put it back.
 *
 * There is no delete. `orders` and `tickets` reference products with
 * `ON DELETE RESTRICT` because a ticket sold last term must still name what was
 * bought, so retiring means the row stops being offered and keeps answering for
 * the past.
 */
export async function setProductActive(productId: string, active: boolean): Promise<void> {
  await apiCall((api) =>
    api.PATCH("/admin/products/{product_id}", {
      params: { path: { product_id: productId } },
      body: { active },
    }),
  );
  revalidatePath("/products");
}
