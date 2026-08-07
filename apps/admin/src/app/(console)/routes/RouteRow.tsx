"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import type { components } from "@unitrack/api-client";

import { setRouteActive } from "./actions";

type Route = components["schemas"]["RouteOut"];

export function RouteRow({ route }: { route: Route }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    if (route.is_active) {
      const ok = window.confirm(
        `Retire "${route.name}" (${route.direction})? Helpers stop being able to start trips on it. Completed trips are unaffected.`,
      );
      if (!ok) return;
    }
    startTransition(async () => {
      try {
        await setRouteActive(route.id, !route.is_active);
      } catch {
        setError("Could not change the route.");
      }
    });
  }

  return (
    <tr className={route.is_active ? undefined : "row-muted"}>
      <td>
        <div className="name">{route.name}</div>
        {error ? <div className="error meta">{error}</div> : null}
      </td>
      <td className="meta">{route.direction}</td>
      <td>
        <span className={`tag tag-${route.is_active ? "approved" : "suspended"}`}>
          {route.is_active ? "active" : "retired"}
        </span>
      </td>
      <td className="actions">
        <Link className="button-link" href={`/routes/${route.id}`}>
          Stops
        </Link>
        <button className="secondary" type="button" disabled={pending} onClick={toggle}>
          {route.is_active ? "Retire" : "Reactivate"}
        </button>
      </td>
    </tr>
  );
}
