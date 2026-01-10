import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Referrals from "./pages/Referrals";
import Mining from "./pages/Mining";
import CoinManagement from "./pages/CoinManagement";
import KYC from "./pages/KYC";
import Payments from "./pages/Payments";
import Notifications from "./pages/Notifications";
import Banners from "./pages/Banners";
import SocialLinks from "./pages/SocialLinks";
import Settings from "./pages/Settings";
import PromoCodes from "./pages/PromoCodes";

// Auth guard component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public route - redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route - Login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="mining" element={<Mining />} />
          <Route path="coins" element={<CoinManagement />} />
          <Route path="kyc" element={<KYC />} />
          <Route path="payments" element={<Payments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="banners" element={<Banners />} />
          <Route path="social-links" element={<SocialLinks />} />
          <Route path="promo-codes" element={<PromoCodes />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
