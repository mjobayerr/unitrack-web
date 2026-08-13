"use client";

import { useState, useTransition } from "react";

import type { components } from "@unitrack/api-client";

import { saveRouteStops } from "../actions";

type Stop = components["schemas"]["StopOut"];
type RouteStop = components["schemas"]["RouteStopOut"];

interface Row {
  stopId: string;
  name: string;
  /** Minutes from trip start, as typed. Kept as a string so a half-entered
   *  value does not become `NaN` on every keystroke. */
  offset: string;
}

/**
 * Build a route's stop list in order.
 *
 * Edits are local until Save, then the **whole list** is sent at once. That
 * mirrors the API exactly, and the API is shaped that way because sequence
 * numbers are unique per route: moving a stop up would need its new position
 * free, which it is not until the stop above has already moved. Sending the
 * final order sidesteps a problem that has no clean incremental solution.
 *
 * Reordering is buttons rather than drag-and-drop. Drag needs a library and a
 * pointer, and this is a list of maybe a dozen stops edited a few times a term
 * — sometimes on a phone. Buttons work everywhere and are reachable by keyboard
 * without any extra work.
 */
export function StopOrderEditor({
  routeId,
  initial,
  allStops,
}: {
  routeId: string;
  initial: RouteStop[];
  allStops: Stop[];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((rs) => ({
      stopId: rs.stop.id,
      name: rs.stop.name,
      offset: rs.scheduled_offset_min === null ? "" : String(rs.scheduled_offset_min),
    })),
  );
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const used = new Set(rows.map((r) => r.stopId));
  const available = allStops.filter((s) => !used.has(s.id));

  function change(next: Row[]) {
    setRows(next);
    setDirty(true);
    setSaved(false);
    setError(null);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    const moving = rows[index];
    const displaced = rows[target];
    // `noUncheckedIndexedAccess` makes both lookups possibly-undefined, which
    // is also the real bounds check: the first or last row has no neighbour.
    if (!moving || !displaced) return;
    change(
      rows.map((row, i) => (i === index ? displaced : i === target ? moving : row)),
    );
  }

  function remove(index: number) {
    change(rows.filter((_, i) => i !== index));
  }

  function add(stopId: string) {
    if (!stopId) return;
    const stop = allStops.find((s) => s.id === stopId);
    if (!stop) return;
    change([...rows, { stopId: stop.id, name: stop.name, offset: "" }]);
  }

  function setOffset(index: number, value: string) {
    change(rows.map((row, i) => (i === index ? { ...row, offset: value } : row)));
  }

  function save() {
    const bad = rows.find(
      (r) => r.offset !== "" && (!Number.isInteger(Number(r.offset)) || Number(r.offset) < 0),
    );
    if (bad) {
      setError(`Minutes for "${bad.name}" must be a whole number, 0 or more.`);
      return;
    }

    startTransition(async () => {
      const message = await saveRouteStops(
        routeId,
        rows.map((r) => ({
          stop_id: r.stopId,
          scheduled_offset_min: r.offset === "" ? null : Number(r.offset),
        })),
      );
      if (message) {
        setError(message);
        return;
      }
      setDirty(false);
      setSaved(true);
    });
  }

  return (
    <>
      <section className="card">
        <div className="card-head">
          <span>Stops, in order</span>
          {dirty ? <span className="tag tag-pending">unsaved</span> : null}
        </div>

        {rows.length === 0 ? (
          <p className="empty">
            No stops on this route yet. Add them below — the order you build here
            is the order the bus travels.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col" className="seq">
                    #
                  </th>
                  <th scope="col">Stop</th>
                  <th scope="col">Minutes from start</th>
                  <th scope="col" className="actions">
                    Move
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.stopId}>
                    <td className="seq meta">{index + 1}</td>
                    <td>
                      <div className="name">{row.name}</div>
                    </td>
                    <td>
                      <input
                        className="narrow"
                        aria-label={`Minutes from start for ${row.name}`}
                        inputMode="numeric"
                        placeholder="—"
                        value={row.offset}
                        disabled={pending}
                        onChange={(e) => setOffset(index, e.target.value)}
                      />
                    </td>
                    <td className="actions">
                      <button
                        className="secondary"
                        type="button"
                        aria-label={`Move ${row.name} earlier`}
                        disabled={pending || index === 0}
                        onClick={() => move(index, -1)}
                      >
                        ↑
                      </button>
                      <button
                        className="secondary"
                        type="button"
                        aria-label={`Move ${row.name} later`}
                        disabled={pending || index === rows.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        ↓
                      </button>
                      <button
                        className="secondary"
                        type="button"
                        aria-label={`Remove ${row.name} from this route`}
                        disabled={pending}
                        onClick={() => remove(index)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="card-foot">
          <label className="inline-label">
            Add a stop
            <select
              value=""
              disabled={pending || available.length === 0}
              onChange={(e) => add(e.target.value)}
            >
              <option value="">
                {available.length === 0 ? "Every stop is already on this route" : "Choose a stop…"}
              </option>
              {available.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name}
                </option>
              ))}
            </select>
          </label>

          <div className="field-actions">
            {error ? <span className="error">{error}</span> : null}
            {saved && !dirty ? <span className="meta">Saved.</span> : null}
            <button type="button" disabled={pending || !dirty} onClick={save}>
              {pending ? "Saving…" : "Save order"}
            </button>
          </div>
        </div>
      </section>

      <p className="footnote">
        Minutes from start is what makes a per-stop ETA possible before any
        traffic data exists, so it is worth filling in even roughly. Leave it
        blank if you do not know yet.
      </p>
    </>
  );
}
