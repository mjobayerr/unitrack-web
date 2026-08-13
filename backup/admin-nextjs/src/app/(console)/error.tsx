"use client";

/**
 * Fallback when a console page throws.
 *
 * Without this, an unreachable backend renders Next's stock error screen: no
 * indication of what broke, and no way forward but the browser's reload button.
 * The likely cause is the API being down, so the message says so rather than
 * guessing at something the operator cannot act on.
 *
 * `error.message` is deliberately not shown — it can carry backend detail, and
 * this page is reachable by anyone who can load the console.
 */
export default function ConsoleError({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <header className="topbar">
        <h1>Something went wrong</h1>
      </header>

      <main>
        <section className="card">
          <p className="empty">
            This page could not be loaded. The API may be unreachable.
            <br />
            <br />
            <button type="button" onClick={reset}>
              Try again
            </button>
          </p>
        </section>
      </main>
    </>
  );
}
