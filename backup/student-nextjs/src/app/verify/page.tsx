import Link from "next/link";

import { API_BASE_URL } from "../../lib/api";

/**
 * Where the emailed confirmation link lands.
 *
 * A server component rather than a client one so the token never reaches the
 * browser's JavaScript — it is a credential, and anything that can read it can
 * activate the account. It arrives in the URL either way, but keeping the
 * exchange server-side means it is not handed to every script on the page.
 *
 * The API does the actual work. This exists because a person reads that link,
 * and `{"id":"…","status":"active"}` looks like a broken site even when it is
 * the correct answer.
 */

export const dynamic = "force-dynamic";

type Outcome = "activated" | "invalid" | "unreachable";

async function confirm(token: string): Promise<Outcome> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    if (response.ok) return "activated";
    // 400 covers forged, malformed and expired; 404 covers a token for an
    // account that has since been deleted. Neither is worth distinguishing to
    // whoever is holding the link — the action is the same.
    return response.status >= 500 ? "unreachable" : "invalid";
  } catch {
    return "unreachable";
  }
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const outcome: Outcome = token ? await confirm(token) : "invalid";

  return (
    <div className="login-page">
      <div className="login">
        {outcome === "activated" ? (
          <>
            <h1>You&rsquo;re all set</h1>
            <p className="sub">
              Your email is confirmed. Sign in and your wallet is ready.
            </p>
            <Link className="button-link" href="/login">
              Sign in
            </Link>
          </>
        ) : outcome === "unreachable" ? (
          <>
            <h1>Try that again</h1>
            <p className="sub">
              We couldn&rsquo;t reach the server just now. Your link is still
              good — open it again in a moment.
            </p>
            <Link className="button-link" href="/login">
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1>This link didn&rsquo;t work</h1>
            <p className="sub">
              It may have expired — links last two days — or already been used.
              If you have confirmed once, just sign in.
            </p>
            <p className="note">
              Otherwise register again and we&rsquo;ll send a fresh one.
            </p>
            <Link className="button-link" href="/login">
              Sign in
            </Link>
            <p className="alt">
              <Link href="/register">Register</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
