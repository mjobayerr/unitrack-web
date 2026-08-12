import { redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { ScreenHeader } from "../ScreenHeader";
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
      <ScreenHeader title="Buy a ticket" subtitle="Single trips & passes" back="/home" />

      <div className="px-4 pt-4">
      {products.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="px-4 py-10 text-center text-muted-foreground">
            Nothing on sale right now.
          </CardContent>
        </Card>
      ) : (
        products.map((product) => (
          <Card key={product.id} className="mb-3 rounded-2xl">
            <CardContent className="px-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="font-semibold">{product.name}</strong>
                  <div className="text-[13px] text-muted-foreground">{describe(product)}</div>
                </div>
                <div className="shrink-0 text-xl font-bold tracking-tight">
                  {taka(product.price_paisa)}
                </div>
              </div>

              {/* A plain form so the action runs server-side and the idempotency
                  key is minted once per submit, not once per render. */}
              <form action={startCheckout}>
                <input type="hidden" name="product_id" value={product.id} />
                {/* Green, not the navy chrome: this is the one action that takes
                    money. bg-success is the darkened green — white on #1db954
                    measures 2.59:1. */}
                <Button
                  type="submit"
                  className="mt-3.5 min-h-[46px] w-full bg-success text-success-foreground hover:bg-success/90"
                >
                  Buy
                </Button>
              </form>
            </CardContent>
          </Card>
        ))
      )}

      <p className="mt-4 text-center text-[13px] text-muted-foreground">
        Payment is handled by SSLCommerz. Card and wallet details never reach UniTrack.
      </p>
      </div>
    </main>
  );
}
