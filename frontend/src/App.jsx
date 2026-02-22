import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RoleProvider, useRole } from "./contexts/RoleContext";
import { Layout } from "./components/components/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { DonorDashboard } from "./pages/DonorDashboard";
import { NGODashboard } from "./pages/NGODashboard";
import { RiderDashboard } from "./pages/RiderDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { CorporateDashboard } from "./pages/CorporateDashboard";
import { CommunityPage } from "./pages/CommunityPage";
import { Register } from "./pages/Register";


function AppRoutes() {
  const { currentRole, getDashboardPath } = useRole();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<Navigate to={getDashboardPath()} replace />} />
          <Route path="/dashboard/donor" element={<DonorDashboard />} />
          <Route path="/dashboard/ngo" element={<NGODashboard />} />
          <Route path="/dashboard/rider" element={<RiderDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/corporate" element={<CorporateDashboard />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <RoleProvider>
        <AppRoutes />
      </RoleProvider>
    </ThemeProvider>
  );
}

export default App;