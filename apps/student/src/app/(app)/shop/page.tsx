import { redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { startCheckout } from "./actions";

type Product = components["schemas"]["ProductOut"];

export const dynamic = "force-dynamic";

/** Paisa are the storage unit; nobody thinks in them. */
function taka(paisa: number): string {
  return `৳${(paisa / 100).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
}

function describe(product: Product): string {
  const rides =
    product.ride_count === null
      ? "Unlimited rides"
      : product.ride_count === 1
        ? "1 ride"
        : `${product.ride_count} rides`;
  return `${rides} · valid ${product.validity_days} days`;
}

export default async function ShopPage() {
  let products: Product[];
  try {
    products = await apiCall((api) => api.GET("/shop/products", {}));
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    throw error;
  }

  return (
    <main>
      <h2>Buy a ticket</h2>

      {products.length === 0 ? (
        <p className="empty">Nothing on sale right now.</p>
      ) : (
        products.map((product) => (
          <div className="card" key={product.id}>
            <div className="row">
              <div>
                <strong>{product.name}</strong>
                <div className="meta">{describe(product)}</div>
              </div>
              <div className="rides">{taka(product.price_paisa)}</div>
            </div>

            {/* A plain form so the action runs server-side and the idempotency
                key is minted once per submit, not once per render. */}
            <form action={startCheckout}>
              <input type="hidden" name="product_id" value={product.id} />
              <button type="submit">Buy</button>
            </form>
          </div>
        ))
      )}

      <p className="meta center">
        Payment is handled by SSLCommerz. Card and wallet details never reach UniTrack.
      </p>
    </main>
  );
}
