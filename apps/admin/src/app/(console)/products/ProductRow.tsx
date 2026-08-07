"use client";

import { useState, useTransition } from "react";

import type { components } from "@unitrack/api-client";

import { paisaToBdt } from "../../../lib/money";
import { setProductActive, updatePrice } from "./actions";

type Product = components["schemas"]["AdminProductOut"];

export function ProductRow({ product }: { product: Product }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(paisaToBdt(product.price_paisa));
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      const message = await updatePrice(product.id, price);
      if (message) setError(message);
      else setEditing(false);
    });
  }

  function cancel() {
    // Reset to the stored value, so an abandoned edit does not leave a
    // half-typed price sitting in the field looking authoritative.
    setPrice(paisaToBdt(product.price_paisa));
    setError(null);
    setEditing(false);
  }

  function toggleActive() {
    setError(null);
    // Withdrawing is the only destructive-looking action here, and it is
    // reversible, so it asks rather than confirms — but it does say what
    // happens, because "students can no longer buy this" is the whole effect.
    if (product.active) {
      const ok = window.confirm(
        `Withdraw "${product.name}"? Students stop seeing it immediately. Tickets already sold are unaffected.`,
      );
      if (!ok) return;
    }
    startTransition(async () => {
      try {
        await setProductActive(product.id, !product.active);
      } catch {
        setError("Could not change the product.");
      }
    });
  }

  return (
    <tr className={product.active ? undefined : "row-muted"}>
      <td>
        <div className="name">{product.name}</div>
        <div className="meta">{product.type}</div>
        {error ? <div className="error meta">{error}</div> : null}
      </td>

      <td>
        {editing ? (
          <div className="inline-edit">
            <input
              aria-label={`Price for ${product.name} in BDT`}
              inputMode="decimal"
              value={price}
              disabled={pending}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
            />
            <button type="button" disabled={pending} onClick={save}>
              {pending ? "Saving…" : "Save"}
            </button>
            <button className="secondary" type="button" disabled={pending} onClick={cancel}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="linkish" type="button" onClick={() => setEditing(true)}>
            ৳ {paisaToBdt(product.price_paisa)}
          </button>
        )}
      </td>

      <td className="meta">{product.ride_count ?? "Unlimited"}</td>
      <td className="meta">{product.validity_days} days</td>

      <td>
        <span className={`tag tag-${product.active ? "approved" : "suspended"}`}>
          {product.active ? "on sale" : "withdrawn"}
        </span>
      </td>

      <td className="actions">
        <button
          className={product.active ? "secondary" : undefined}
          type="button"
          disabled={pending}
          onClick={toggleActive}
        >
          {product.active ? "Withdraw" : "Put on sale"}
        </button>
      </td>
    </tr>
  );
}
