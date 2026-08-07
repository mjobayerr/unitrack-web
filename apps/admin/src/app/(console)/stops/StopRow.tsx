"use client";

import { useState, useTransition } from "react";

import type { components } from "@unitrack/api-client";

import { deleteStop, updateStop } from "./actions";

type Stop = components["schemas"]["StopOut"];

export function StopRow({ stop }: { stop: Stop }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({
    name: stop.name,
    lat: String(stop.lat),
    lng: String(stop.lng),
  });
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setValues({ name: stop.name, lat: String(stop.lat), lng: String(stop.lng) });
    setError(null);
    setEditing(false);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const message = await updateStop(stop.id, values);
      if (message) setError(message);
      else setEditing(false);
    });
  }

  function remove() {
    const ok = window.confirm(`Delete "${stop.name}"? This cannot be undone.`);
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      // A refusal is the normal case, not a failure: the API blocks deleting a
      // stop a route still uses and names the count. Showing that verbatim is
      // more useful than "could not delete".
      const message = await deleteStop(stop.id);
      if (message) setError(message);
    });
  }

  if (editing) {
    return (
      <tr>
        <td colSpan={3}>
          <div className="inline-edit">
            <input
              aria-label="Stop name"
              value={values.name}
              disabled={pending}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
            />
            <input
              aria-label="Latitude"
              inputMode="decimal"
              value={values.lat}
              disabled={pending}
              onChange={(e) => setValues({ ...values, lat: e.target.value })}
            />
            <input
              aria-label="Longitude"
              inputMode="decimal"
              value={values.lng}
              disabled={pending}
              onChange={(e) => setValues({ ...values, lng: e.target.value })}
            />
          </div>
          {error ? <div className="error meta">{error}</div> : null}
        </td>
        <td className="actions">
          <button type="button" disabled={pending} onClick={save}>
            {pending ? "Saving…" : "Save"}
          </button>
          <button className="secondary" type="button" disabled={pending} onClick={reset}>
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>
        <div className="name">{stop.name}</div>
        {error ? <div className="error meta">{error}</div> : null}
      </td>
      <td className="meta mono">{stop.lat.toFixed(5)}</td>
      <td className="meta mono">{stop.lng.toFixed(5)}</td>
      <td className="actions">
        <button className="secondary" type="button" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button className="secondary" type="button" disabled={pending} onClick={remove}>
          {pending ? "…" : "Delete"}
        </button>
      </td>
    </tr>
  );
}
