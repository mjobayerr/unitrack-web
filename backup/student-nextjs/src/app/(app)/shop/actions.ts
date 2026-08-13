"use server";

import { randomUUID } from "node:crypto";

import { redirect } from "next/navigation";

import { apiCall } from "../../../lib/api";

/**
 * Start a purchase and send the student to the payment gateway.
 *
 * The idempotency key is generated **here**, on the server, per submission.
 * Generating it in the browser would let a double-tapped Buy button send two
 * different keys and create two orders — two charges for one ticket. A server
 * action runs once per submit, so one key per intent to buy.
 *
 * The redirect leaves this app entirely: SSLCommerz hosts the payment page,
 * which is what keeps card and wallet details out of our hands completely.
 */
export async function startCheckout(formData: FormData): Promise<void> {
  const productId = String(formData.get("product_id") ?? "");
  if (!productId) return;

  const checkout = await apiCall((api) =>
    api.POST("/shop/orders", {
      body: { product_id: productId, idempotency_key: randomUUID().replace(/-/g, "") },
    }),
  );

  // Outside try/catch on purpose: Next implements redirect by throwing, so
  // wrapping this would swallow the navigation and leave the student staring
  // at a page that did nothing.
  redirect(checkout.checkout_url);
}
