/**
 * The handful of icons the student app needs, inlined.
 *
 * The design reference (PR #7) uses lucide-react. These are drawn to match it —
 * same 24px grid, same 2px round-joined stroke — without adding a dependency for
 * five glyphs. `currentColor` throughout, so the active/inactive tab colour is a
 * single CSS property rather than two copies of each icon.
 *
 * They replace emoji. An emoji is not a neutral choice: it renders in the
 * platform's own colours, so it cannot go blue when its tab is selected, and it
 * looks materially different on Android, iOS and Windows — the tab bar was the
 * one part of the app guaranteed to look wrong on somebody's phone.
 */

type IconProps = { className?: string };

/** Shared frame. `strokeWidth` is bumped on the active tab by CSS, not here. */
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

/** Wallet — the ticket list. */
export function TicketIcon(_: IconProps) {
  return (
    <Glyph>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
      <path d="M13 6v12" strokeDasharray="2 3" />
    </Glyph>
  );
}

/** Shop. */
export function BuyIcon(_: IconProps) {
  return (
    <Glyph>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2 3h2.5l2.2 11.2a1.8 1.8 0 0 0 1.8 1.4h9.1a1.8 1.8 0 0 0 1.8-1.4L21 7H5.3" />
    </Glyph>
  );
}

/** Live map. */
export function BusIcon(_: IconProps) {
  return (
    <Glyph>
      <path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
      <path d="M4 11h16" />
      <path d="M7 18v2M17 18v2" />
      <circle cx="8" cy="14.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14.5" r="0.6" fill="currentColor" stroke="none" />
    </Glyph>
  );
}
