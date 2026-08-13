"use client";

import { useActionState } from "react";

import { login, type LoginState } from "./actions";

const INITIAL: LoginState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, INITIAL);

  return (
    <div className="login-page">
      <form className="login" action={action}>
        <h1>UniTrack Admin</h1>
        <p className="sub">Fleet operations console</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="admin@ulab.edu.bd"
          autoComplete="username"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        {state.error ? <p className="error">{state.error}</p> : null}

        <button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
