"use client";

import { useTheme } from "./useTheme";

/**
 * Light/dark switch, shared by both apps.
 *
 * `role="switch"` rather than a checkbox: it acts on press and carries no form
 * value. The label states what is on, not what pressing does — a control reading
 * "Dark" over a light page is the usual way these become ambiguous.
 *
 * `className` is the caller's, so the student's navy band and the console's
 * slate rail can each style it as one of their own controls.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, ready, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      // Neutral until the client has read storage, so server and first client
      // render agree.
      aria-checked={ready ? dark : false}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggle}
      className={`inline-flex cursor-pointer items-center gap-2 [&_svg]:size-4 ${className}`.trim()}
    >
      {dark ? <MoonIcon /> : <SunIcon />}
      {/* Kept mounted and merely hidden, so the row does not reflow after load,
          and min-w holds the width of the longer word across a toggle. */}
      <span
        className="min-w-[2.6em] text-left"
        style={{ visibility: ready ? "visible" : "hidden" }}
      >
        {dark ? "Dark" : "Light"}
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
    </svg>
  );
}
