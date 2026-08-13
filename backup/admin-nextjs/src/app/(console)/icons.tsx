/**
 * Sidebar icons, inlined.
 *
 * The design reference uses lucide-react; these are drawn to match it on the
 * same 24px grid with a 2px round-joined stroke, without pulling a dependency in
 * for seven glyphs. `currentColor` throughout, so the active and hover states are
 * one CSS property rather than a variant per icon.
 *
 * Icons are not decoration on this rail. Seven text-only labels read as a list of
 * words an operator has to parse; a shape per destination is what makes the one
 * they want findable at a glance, and it is the difference between the reference's
 * console and a nav menu.
 */

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Live fleet — a map pin, because this is the "where is everything" page. */
export function FleetIcon() {
  return (
    <Glyph>
      <path d="M20 10c0 4.4-5.4 9.5-7.4 11.2a1 1 0 0 1-1.3 0C9.4 19.5 4 14.4 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </Glyph>
  );
}

/** Helpers — the approval queue. */
export function HelpersIcon() {
  return (
    <Glyph>
      <path d="M15.5 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H6.4A3.4 3.4 0 0 0 3 18.4V20" />
      <circle cx="9.2" cy="8.2" r="3.3" />
      <path d="M17 11.2 19 13.2 22.5 9.7" />
    </Glyph>
  );
}

/** Alerts — the emergency console. */
export function AlertsIcon() {
  return (
    <Glyph>
      <path d="M10.3 4.3a2 2 0 0 1 3.4 0l7 12.1A2 2 0 0 1 19 19.4H5a2 2 0 0 1-1.7-3L10.3 4.3Z" />
      <path d="M12 9.4v3.6" />
      <circle cx="12" cy="16" r="0.7" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/** Products — what is for sale. */
export function ProductsIcon() {
  return (
    <Glyph>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
      <path d="M13 6v12" strokeDasharray="2 3" />
    </Glyph>
  );
}

/** Routes. */
export function RoutesIcon() {
  return (
    <Glyph>
      <circle cx="6" cy="18.5" r="2.5" />
      <circle cx="18" cy="5.5" r="2.5" />
      <path d="M15.5 5.5H10a3.5 3.5 0 0 0 0 7h4a3.5 3.5 0 0 1 0 7H8.5" />
    </Glyph>
  );
}

/** Stops. */
export function StopsIcon() {
  return (
    <Glyph>
      <path d="M12 21s-6-5.1-6-9.6A6 6 0 0 1 18 11.4c0 4.5-6 9.6-6 9.6Z" />
      <path d="M9.5 11.4h5" />
    </Glyph>
  );
}

/** Sign out. */
export function SignOutIcon() {
  return (
    <Glyph>
      <path d="M9.5 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3.5" />
      <path d="M15.5 16l4-4-4-4" />
      <path d="M19 12H9.5" />
    </Glyph>
  );
}
