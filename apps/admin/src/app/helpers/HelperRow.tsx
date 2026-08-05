"use client";

import { useTransition } from "react";

import type { components } from "@unitrack/api-client";

import { approveHelper, suspendUser } from "./actions";

type Helper = components["schemas"]["HelperOut"];

export function HelperRow({ helper }: { helper: Helper }) {
  const [pending, startTransition] = useTransition();

  // Suspension is the one action here that cuts someone off mid-shift — a
  // helper on a live trip stops being able to send GPS the moment it lands —
  // so it asks first. Approval is additive and does not.
  function confirmSuspend() {
    const ok = window.confirm(
      `Suspend ${helper.name}? They will be signed out immediately and any live trip stops reporting.`,
    );
    if (ok) startTransition(() => void suspendUser(helper.user_id));
  }

  return (
    <tr>
      <td>{helper.name}</td>
      <td>{helper.email}</td>
      <td>{helper.phone ?? "—"}</td>
      <td>
        <span className={`tag tag-${helper.helper_status}`}>{helper.helper_status}</span>
      </td>
      <td>
        <span className="tag">{helper.user_status}</span>
      </td>
      <td>
        {helper.helper_status === "pending" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => void approveHelper(helper.helper_id))}
          >
            {pending ? "Approving…" : "Approve"}
          </button>
        ) : helper.user_status === "suspended" ? null : (
          <button className="secondary" type="button" disabled={pending} onClick={confirmSuspend}>
            {pending ? "Suspending…" : "Suspend"}
          </button>
        )}
      </td>
    </tr>
  );
}
