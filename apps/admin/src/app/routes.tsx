import { createBrowserRouter, Navigate } from "react-router";

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

// Standalone admin app. The route tree keeps its "/admin" prefix so AdminLayout's
// own navigation (which links to /admin/*) works unchanged; "/" just lands there.
export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/admin" replace /> },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminLogin },
      { path: "dashboard", Component: AdminDashboard },
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
