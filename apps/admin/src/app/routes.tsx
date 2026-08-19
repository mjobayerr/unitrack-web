import { createBrowserRouter } from "react-router";

import { RequireAdmin, RedirectIfAuthed } from "../lib/guards";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminLogin } from "./screens/admin/AdminLogin";
import { AdminDashboard } from "./screens/admin/AdminDashboard";
import { LiveMonitoring } from "./screens/admin/LiveMonitoring";
import { BusManagement } from "./screens/admin/BusManagement";
import { RouteManagement } from "./screens/admin/RouteManagement";
import { UserManagement } from "./screens/admin/UserManagement";
import { EmergencyAlerts } from "./screens/admin/EmergencyAlerts";
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
      { path: "buses", Component: BusManagement },
      { path: "routes", Component: RouteManagement },
      { path: "users", Component: UserManagement },
      { path: "history", Component: BusHistory },
      { path: "emergency", Component: EmergencyAlerts },
    ],
  },
]);
