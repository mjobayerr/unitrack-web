import { redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { formatBdt } from "../../../lib/money";
import { NewProduct } from "./NewProduct";
import { ProductRow } from "./ProductRow";

type Product = components["schemas"]["AdminProductOut"];

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  let products: Product[];
  try {
    products = await apiCall((api) => api.GET("/admin/products", {}));
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    throw error;
  }

  // On sale first, then by price. An operator comes here to check or change
  // what students can buy right now; withdrawn products are reference.
  const ordered = [...products].sort((a, b) =>
    a.active === b.active ? a.price_paisa - b.price_paisa : a.active ? -1 : 1,
  );

  const onSale = ordered.filter((p) => p.active);
  const cheapest = onSale.length ? Math.min(...onSale.map((p) => p.price_paisa)) : null;

  return (
    <>
      <header className="topbar">
        <h1>Products</h1>
        <span className="who">Administrator</span>
      </header>

      <main>
        <div className="page-head">
          <h2>Ticket catalogue</h2>
          <p className="sub">
            {onSale.length === 0
              ? "Nothing is on sale — students cannot buy a ticket."
              : `${onSale.length} product${onSale.length === 1 ? "" : "s"} on sale.`}
          </p>
        </div>

        <section className="stats">
          <div className="stat">
            <div className="label">On sale</div>
            <div className={`value${onSale.length === 0 ? " attention" : ""}`}>
              {onSale.length}
            </div>
          </div>
          <div className="stat">
            <div className="label">Withdrawn</div>
            <div className="value">{ordered.length - onSale.length}</div>
          </div>
          <div className="stat">
            <div className="label">Cheapest fare</div>
            <div className="value">{cheapest === null ? "—" : formatBdt(cheapest)}</div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <span>Catalogue</span>
            <NewProduct />
          </div>

          {ordered.length === 0 ? (
            <p className="empty">
              No products yet. Until one exists, checkout has nothing to sell.
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Price</th>
                    <th scope="col">Rides</th>
                    <th scope="col">Validity</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="actions">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ordered.map((product) => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="footnote">
          Prices are copied onto an order when it is created, so changing one
          here never rewrites what someone already paid.
        </p>
      </main>
    </>
  );
}
