import { createBrowserRouter } from "react-router";

import { Login } from "./screens/Login";
import { SignUp } from "./screens/SignUp";
import { Verify } from "./screens/Verify";
import { ForgotPassword } from "./screens/ForgotPassword";
import { ResetPassword } from "./screens/ResetPassword";
import { RequireAuth, RedirectIfAuthed } from "../lib/guards";

import { StudentLayout } from "./layouts/StudentLayout";
import { Home } from "./screens/Home";
import { LiveMap } from "./screens/LiveMap";
import { Wallet } from "./screens/Wallet";
import { QRPayment } from "./screens/QRPayment";
import { TransactionHistory } from "./screens/TransactionHistory";
import { Profile } from "./screens/Profile";
import { ProfileEdit } from "./screens/ProfileEdit";

// The dashboard is the app root. RequireAuth is the "middleware": a signed-out
// visitor to "/" (or any tab under it) is redirected to /login; a signed-in one
// on /login or /signup is bounced back to "/". There is no public splash — the
// entry point is the dashboard or the login screen, nothing in between.
export const router = createBrowserRouter([
  { path: "/login", element: <RedirectIfAuthed><Login /></RedirectIfAuthed> },
  { path: "/signup", element: <RedirectIfAuthed><SignUp /></RedirectIfAuthed> },
  { path: "/verify", Component: Verify },
  // Public like /verify: a signed-out student needs both, and the reset link in
  // the email carries the token that stands in for a session.
  { path: "/forgot-password", Component: ForgotPassword },
  { path: "/reset-password", Component: ResetPassword },
  {
    path: "/",
    element: (
      <RequireAuth>
        <StudentLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, Component: Home },
      { path: "map", Component: LiveMap },
      { path: "wallet", Component: Wallet },
      { path: "pay", Component: QRPayment },
      { path: "history", Component: TransactionHistory },
      { path: "profile", Component: Profile },
      { path: "profile/edit", Component: ProfileEdit },
    ],
  },
]);
