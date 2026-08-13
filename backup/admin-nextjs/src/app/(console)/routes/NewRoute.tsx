"use client";

import { useRef, useState, useTransition } from "react";

import { createRoute } from "./actions";

export function NewRoute() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useRef<HTMLFormElement>(null);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const message = await createRoute(formData);
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
        Add a route
      </button>
    );
  }

  return (
    <form ref={form} action={submit} className="stack-form">
      <div className="field-row">
        <label>
          Name
          <input name="name" required placeholder="Dhanmondi" disabled={pending} />
        </label>
        <label>
          Direction
          <select name="direction" defaultValue="inbound" disabled={pending}>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
        </label>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="field-actions">
        <button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create route"}
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
        An out-and-back pair shares a name — create it twice, once per
        direction. Stops are added afterwards.
      </p>
    </form>
  );
}
