"use server";

/**
 * Login and logout as server actions.
 *
 * The password is posted to this server, exchanged for tokens against FastAPI,
 * and the tokens are written straight into httpOnly cookies. The browser never
 * holds a credential at any point in the flow.
 */

import { redirect } from "next/navigation";

import { API_BASE_URL } from "../../lib/api";
import { clearSession, readAccessToken, readRefreshToken, saveSession, type TokenPair } from "../../lib/session";

export interface LoginState {
  error?: string;
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email and password are required." };

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    // The backend deliberately returns the same message for an unknown address
    // and a wrong password, and spends the same time on both. Passing its
    // wording straight through would be fine; keeping our own avoids leaking
    // any future change in that detail to the login form.
    return {
      error:
        response.status === 403
          ? "This account is not active."
          : "Incorrect email or password.",
    };
  }

  await saveSession((await response.json()) as TokenPair);
  redirect("/helpers");
}

export async function logout(): Promise<void> {
  const accessToken = await readAccessToken();
  const refreshToken = await readRefreshToken();

  // Tell the backend to revoke both tokens. Dropping the cookies alone would
  // leave a 30-day refresh token valid for anyone who had already copied it.
  if (accessToken) {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken ?? null }),
      cache: "no-store",
    }).catch(() => {
      // A failed revoke must not strand the user in a session they asked to
      // end; the cookies still go, and the tokens expire on their own.
    });
  }

  await clearSession();
  redirect("/login");
}
