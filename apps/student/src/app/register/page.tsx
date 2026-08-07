"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";

import { register, resendVerification, type RegisterState } from "./actions";

const INITIAL: RegisterState = {};

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, INITIAL);

  // Registration succeeded but the account is not usable yet. Showing the
  // sign-in form here would invite a student to try a password that is correct
  // and still be refused, which reads as a broken site rather than a pending
  // confirmation.
  if (state.registered) {
    return <CheckYourEmail email={state.registered} />;
  }

  return (
    <div className="login-page">
      <form className="login" action={action}>
        <h1>UniTrack</h1>
        <p className="sub">Create your student account</p>

        <label htmlFor="name">Full name</label>
        <input id="name" name="name" autoComplete="name" required />

        <label htmlFor="email">University email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="student@ulab.edu.bd"
          autoComplete="username"
          required
        />

        <label htmlFor="student_id_no">Student ID</label>
        <input
          id="student_id_no"
          name="student_id_no"
          placeholder="221011001"
          inputMode="numeric"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
          required
        />

        {state.error ? <p className="error">{state.error}</p> : null}

        <button type="submit" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </button>

        <p className="alt">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

function CheckYourEmail({ email }: { email: string }) {
  const [sending, startTransition] = useTransition();
  const [resent, setResent] = useState(false);

  return (
    <div className="login-page">
      <div className="login">
        <h1>Check your email</h1>
        <p className="sub">
          We sent a confirmation link to <strong>{email}</strong>. Click it and
          you can sign in.
        </p>

        <p className="note">
          Nothing after a minute or two? Look in spam — the message comes from a
          no-reply address, which filters treat harshly.
        </p>

        <button
          type="button"
          className="secondary"
          disabled={sending || resent}
          onClick={() =>
            startTransition(async () => {
              await resendVerification(email);
              setResent(true);
            })
          }
        >
          {sending ? "Sending…" : resent ? "Sent again" : "Resend the email"}
        </button>

        <p className="alt">
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
