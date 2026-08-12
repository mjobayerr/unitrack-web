import type { Metadata } from "next";
import type { ReactNode } from "react";

import { THEME_INIT_SCRIPT } from "@unitrack/theme";

import "./globals.css";

export const metadata: Metadata = {
  title: "UniTrack Admin",
  description: "Fleet operations console for UniTrack.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning because the script below writes `data-theme` and
    // `style` onto this element before React hydrates. Without it React sees
    // attributes the server did not render and warns on every page load. Scoped
    // to <html> alone, so a genuine mismatch anywhere inside is still reported.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Resolves the theme before the first paint. In <head> and synchronous
            on purpose: run any later and the page paints light and then snaps to
            dark, which is the white flash that makes a dark app feel broken
            every single time it is opened. It writes one attribute and touches
            nothing else. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
