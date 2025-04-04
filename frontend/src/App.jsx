import { Route, Routes, useLocation } from "react-router";
import "./App.css";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { EmployeeDashboard } from "./pages/EmployeeDashboard";
import { Signin } from "./pages/Signin";
import { Signup } from "./pages/Signup";
import { ManagerDashboard } from "./pages/ManagerDashboard";
import { HRDashboard } from "./pages/HRDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import Navbar from "./components/shared/Navbar";
import NotFound from "./pages/notFound";

function App() {
  const pathname = useLocation();
  const isPublicRoute =
    pathname.pathname === "/signin" || pathname.pathname === "/register";
  return (
    <>
      {!isPublicRoute && <Navbar></Navbar>}
      <div className="w-full md:max-w-6xl mx-auto px-4">
        <Routes>
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/signin" element={<Signin />} />
          <Route path="/register" element={<Signup />} />
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Manager"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/dashboard"
            element={
              <ProtectedRoute allowedRoles={["HR"]}>
                <HRDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Toaster />
    </>
  );
}

export default App;
