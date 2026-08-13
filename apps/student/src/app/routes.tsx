import { createBrowserRouter } from "react-router";

import { Splash } from "./screens/Splash";
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

// Student app only. Helper was removed entirely and admin now lives in its own
// app (apps/admin); there are deliberately no links from here to either.
export const router = createBrowserRouter([
  { path: "/", Component: Splash },
  { path: "/login", element: <RedirectIfAuthed><Login /></RedirectIfAuthed> },
  { path: "/signup", element: <RedirectIfAuthed><SignUp /></RedirectIfAuthed> },
  { path: "/verify", Component: Verify },
  {
    path: "/app",
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
