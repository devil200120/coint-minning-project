import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
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
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
