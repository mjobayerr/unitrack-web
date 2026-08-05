"use client";

import { useState, useTransition } from "react";

import type { components } from "@unitrack/api-client";

import { approveHelper, suspendUser } from "./actions";

type Helper = components["schemas"]["HelperOut"];

export function HelperRow({ helper }: { helper: Helper }) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function run(action: () => Promise<void>) {
    setFailed(false);
    startTransition(async () => {
      try {
        await action();
      } catch {
        // A server action that throws would otherwise fail silently here and
        // leave the row looking unchanged with no explanation.
        setFailed(true);
      }
    });
  }

  // Suspension cuts someone off mid-shift — a helper on a live trip stops being
  // able to send GPS the moment it lands — so it asks first. Approval is
  // additive and does not.
  function confirmSuspend() {
    const ok = window.confirm(
      `Suspend ${helper.name}? They are signed out immediately and any live trip stops reporting.`,
    );
    if (ok) run(() => suspendUser(helper.user_id));
  }

  return (
    <tr>
      <td>
        <div className="name">{helper.name}</div>
        <div className="meta">{helper.email}</div>
        {failed ? <div className="error meta">Action failed — try again.</div> : null}
      </td>
      <td className="meta">{helper.phone ?? "—"}</td>
      <td>
        <span className={`tag tag-${helper.helper_status}`}>{helper.helper_status}</span>
      </td>
      <td>
        <span className={`tag tag-${helper.user_status}`}>
          {helper.user_status.replace("_", " ")}
        </span>
      </td>
      <td className="actions">
        {helper.helper_status === "pending" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => approveHelper(helper.helper_id))}
          >
            {pending ? "Approving…" : "Approve"}
          </button>
        ) : helper.user_status === "suspended" ? (
          <span className="meta">—</span>
        ) : (
          <button className="secondary" type="button" disabled={pending} onClick={confirmSuspend}>
            {pending ? "Suspending…" : "Suspend"}
          </button>
        )}
      </td>
    </tr>
  );
}
