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

import { HelperLayout } from "./layouts/HelperLayout";
import { HelperLogin } from "./screens/helper/HelperLogin";
import { HelperDashboard } from "./screens/helper/HelperDashboard";
import { StartTrip } from "./screens/helper/StartTrip";
import { EndTrip } from "./screens/helper/EndTrip";
import { QRVerification } from "./screens/helper/QRVerification";
import { LivePassengerCounter } from "./screens/helper/LivePassengerCounter";
import { EmergencyAlert } from "./screens/helper/EmergencyAlert";
import { HelperProfile } from "./screens/helper/HelperProfile";

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

  {
    path: "/helper",
    Component: HelperLayout,
    children: [
      { index: true, Component: HelperLogin },
      { path: "dashboard", Component: HelperDashboard },
      { path: "start-trip", Component: StartTrip },
      { path: "end-trip", Component: EndTrip },
      { path: "qr", Component: QRVerification },
      { path: "counter", Component: LivePassengerCounter },
      { path: "emergency", Component: EmergencyAlert },
      { path: "profile", Component: HelperProfile },
    ],
  },

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
