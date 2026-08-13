import { createBrowserRouter } from "react-router";

import { Login } from "./screens/Login";
import { SignUp } from "./screens/SignUp";
import { Verify } from "./screens/Verify";
import { RequireAuth, RedirectIfAuthed } from "../lib/guards";

import { StudentLayout } from "./layouts/StudentLayout";
import { Home } from "./screens/Home";
import { LiveMap } from "./screens/LiveMap";
import { Wallet } from "./screens/Wallet";
import { QRPayment } from "./screens/QRPayment";
import { TransactionHistory } from "./screens/TransactionHistory";
import { Profile } from "./screens/Profile";

// The dashboard is the app root. RequireAuth is the "middleware": a signed-out
// visitor to "/" (or any tab under it) is redirected to /login; a signed-in one
// on /login or /signup is bounced back to "/". There is no public splash — the
// entry point is the dashboard or the login screen, nothing in between.
export const router = createBrowserRouter([
  { path: "/login", element: <RedirectIfAuthed><Login /></RedirectIfAuthed> },
  { path: "/signup", element: <RedirectIfAuthed><SignUp /></RedirectIfAuthed> },
  { path: "/verify", Component: Verify },
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
    ],
  },
]);
