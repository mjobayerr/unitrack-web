"use client";

import { useActionState } from "react";

import { login, type LoginState } from "./actions";

const INITIAL: LoginState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, INITIAL);

  return (
    <main>
      <form className="login" action={action}>
        <h1>UniTrack Admin</h1>
        <p className="sub">Sign in with an administrator account.</p>

        <input
          name="email"
          type="email"
          placeholder="admin@ulab.edu.bd"
          autoComplete="username"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
        />

        {state.error ? <p className="error">{state.error}</p> : null}

        <button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
