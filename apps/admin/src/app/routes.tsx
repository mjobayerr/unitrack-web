import { createBrowserRouter } from "react-router";

import { RequireAdmin, RedirectIfAuthed } from "../lib/guards";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminLogin } from "./screens/admin/AdminLogin";
import { AdminDashboard } from "./screens/admin/AdminDashboard";
import { LiveMonitoring } from "./screens/admin/LiveMonitoring";
import { RevenueDashboard } from "./screens/admin/RevenueDashboard";
import { RidershipDashboard } from "./screens/admin/RidershipDashboard";
import { BusManagement } from "./screens/admin/BusManagement";
import { RouteManagement } from "./screens/admin/RouteManagement";
import { UserManagement } from "./screens/admin/UserManagement";
import { WalletTransactions } from "./screens/admin/WalletTransactions";
import { EmergencyAlerts } from "./screens/admin/EmergencyAlerts";
import { TripHistory } from "./screens/admin/TripHistory";
import { BusHistory } from "./screens/admin/BusHistory";

// The dashboard is the console root, behind RequireAdmin (the "middleware"): a
// signed-out visitor to "/" or any panel is sent to /login; a signed-in admin on
// /login is bounced to "/". Everything lives at the root now — the old "/admin"
// prefix is gone.
export const router = createBrowserRouter([
  { path: "/login", element: <RedirectIfAuthed><AdminLogin /></RedirectIfAuthed> },
  {
    path: "/",
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, Component: AdminDashboard },
      { path: "monitoring", Component: LiveMonitoring },
      { path: "revenue", Component: RevenueDashboard },
      { path: "ridership", Component: RidershipDashboard },
      { path: "buses", Component: BusManagement },
      { path: "routes", Component: RouteManagement },
      { path: "users", Component: UserManagement },
      { path: "history", Component: BusHistory },
      { path: "wallet", Component: WalletTransactions },
      { path: "emergency", Component: EmergencyAlerts },
      { path: "trips", Component: TripHistory },
    ],
  },
]);
