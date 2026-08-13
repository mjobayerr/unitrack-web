"use client";

import { useRef, useState, useTransition } from "react";

import { createStop } from "./actions";

export function NewStop() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useRef<HTMLFormElement>(null);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const message = await createStop(formData);
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
        Add a stop
      </button>
    );
  }

  return (
    <form ref={form} action={submit} className="stack-form">
      <div className="field-row">
        <label>
          Name
          <input name="name" required placeholder="Farmgate" disabled={pending} />
        </label>
        <label>
          Latitude
          <input name="lat" inputMode="decimal" required placeholder="23.75810" disabled={pending} />
        </label>
        <label>
          Longitude
          <input name="lng" inputMode="decimal" required placeholder="90.38970" disabled={pending} />
        </label>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="field-actions">
        <button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create stop"}
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
      <p className="footnote">
        Coordinates come from any map — right-click a point in Google Maps and
        the first number is latitude.
      </p>
    </form>
  );
}
