"use client";

import { useRef, useState, useTransition } from "react";

import { createProduct } from "./actions";

/**
 * Add something to the catalogue.
 *
 * Collapsed by default: this page is read far more often than it is written to,
 * and a permanently open form pushes the actual catalogue below the fold.
 */
export function NewProduct() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useRef<HTMLFormElement>(null);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const message = await createProduct(formData);
      if (message) {
        setError(message);
        return;
      }
      form.current?.reset();
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}>
        Add a product
      </button>
    );
  }

  return (
    <form ref={form} action={submit} className="stack-form">
      <div className="field-row">
        <label>
          Name
          <input name="name" required placeholder="Single ride" disabled={pending} />
        </label>

        <label>
          Type
          <select name="type" defaultValue="single" disabled={pending}>
            <option value="single">Single</option>
            <option value="bulk">Bulk</option>
            <option value="package">Package</option>
          </select>
        </label>
      </div>

      <div className="field-row">
        <label>
          Price (BDT)
          <input name="price_bdt" inputMode="decimal" required placeholder="30.00" disabled={pending} />
        </label>

        <label>
          Rides
          <input name="ride_count" inputMode="numeric" placeholder="Blank = unlimited" disabled={pending} />
        </label>

        <label>
          Valid for (days)
          <input name="validity_days" inputMode="numeric" defaultValue={30} disabled={pending} />
        </label>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="field-actions">
        <button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create product"}
        </button>
        <button
          className="secondary"
          type="button"
          disabled={pending}
          onClick={() => {
            setError(null);
            setOpen(false);
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
