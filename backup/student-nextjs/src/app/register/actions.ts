"use server";

/**
 * Student signup.
 *
 * The email domain is checked here **and** by the API. This copy exists only so
 * a student who mistypes their address is told immediately instead of after a
 * round trip — it is not the control. `POST /auth/register/student` answers 403
 * for anything outside the allow-list regardless of what this file does, which
 * is what matters, because a form is trivially bypassed.
 */

import { API_BASE_URL } from "../../lib/api";

/**
 * Kept in step with `ALLOWED_STUDENT_EMAIL_DOMAINS` on the backend.
 *
 * Duplicated rather than fetched: the API exposes no endpoint for it, and
 * adding one would publish the university's allow-list to anyone who asked.
 * If they drift, the server wins and the student sees its message.
 */
const ALLOWED_DOMAINS = ["ulab.edu.bd"];

export interface RegisterState {
  error?: string;
  /** The address we sent to, so the page can say "check <this> inbox". */
  registered?: string;
}

function domainOf(email: string): string {
  // Everything after the FINAL `@`. Splitting on the first would read
  // `a@b@evil.com` as `b`, which is how a lookalike gets waved through.
  return email.trim().toLowerCase().split("@").pop() ?? "";
}

export async function register(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const studentIdNo = String(formData.get("student_id_no") ?? "").trim();

  if (!email || !password || !name || !studentIdNo) {
    return { error: "Every field is required." };
  }
  if (!ALLOWED_DOMAINS.includes(domainOf(email))) {
    return {
      error: `Use your university email address (@${ALLOWED_DOMAINS[0]}).`,
    };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const response = await fetch(`${API_BASE_URL}/auth/register/student`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      name,
      student_id_no: studentIdNo,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 409) {
      // Deliberately not "that email is taken, log in instead" — this page is
      // public, so a distinct answer would let anyone test which students hold
      // accounts. The wording covers both cases truthfully.
      return {
        error: "That address cannot be registered. Try signing in, or resend the confirmation email.",
      };
    }
    if (response.status === 403) {
      return { error: `Use your university email address (@${ALLOWED_DOMAINS[0]}).` };
    }
    return { error: "Could not create the account. Try again in a moment." };
  }

  // No redirect and no session: the account exists but cannot be used until the
  // emailed link is clicked, so sending them to a wallet they cannot open would
  // be a worse lie than staying put and explaining.
  return { registered: email };
}

/** Ask for the confirmation link again. Always reports success — the API
 *  answers identically for an address that does not exist, and undoing that
 *  here would rebuild the enumeration oracle it exists to prevent. */
export async function resendVerification(email: string): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/resend-verification`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store",
  }).catch(() => {
    // A failed resend is not worth an error screen: the student can press it
    // again, and the first email may well arrive meanwhile.
  });
}
