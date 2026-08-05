"use client";

import { useState, useTransition } from "react";

import type { components } from "@unitrack/api-client";

import { acknowledgeAlert, resolveAlert } from "./actions";

type Alert = components["schemas"]["AlertOut"];

/** `sos` reads as an acronym; the rest are snake_case machine values. */
function label(type: string): string {
  return type === "sos" ? "SOS" : type.replace(/_/g, " ");
}

function since(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function AlertRow({ alert }: { alert: Alert }) {
  const [pending, startTransition] = useTransition();
  const [resolving, setResolving] = useState(false);
  const [note, setNote] = useState("");
  const [failed, setFailed] = useState(false);

  function run(action: () => Promise<void>) {
    setFailed(false);
    startTransition(async () => {
      try {
        await action();
        setResolving(false);
        setNote("");
      } catch {
        setFailed(true);
      }
    });
  }

  return (
    <tr>
      <td>
        <div className="name">{label(alert.type)}</div>
        <div className="meta">{alert.message ?? "No message"}</div>
        {alert.lat != null && alert.lng != null ? (
          <div className="meta">
            {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
          </div>
        ) : null}
        {failed ? <div className="error meta">Action failed — try again.</div> : null}
      </td>
      <td>
        <span className={`tag tag-${alert.severity}`}>{alert.severity}</span>
      </td>
      <td>
        <span className="tag">{alert.status}</span>
      </td>
      <td className="meta" title={alert.created_at}>
        {since(alert.created_at)}
      </td>
      <td className="actions">
        {resolving ? (
          <div className="resolve-form">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was done?"
              maxLength={500}
              autoFocus
            />
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => resolveAlert(alert.id, note))}
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              className="secondary"
              type="button"
              disabled={pending}
              onClick={() => setResolving(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            {alert.status === "open" ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => acknowledgeAlert(alert.id))}
              >
                {pending ? "…" : "Acknowledge"}
              </button>
            ) : null}{" "}
            <button
              className="secondary"
              type="button"
              disabled={pending}
              onClick={() => setResolving(true)}
            >
              Resolve
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
