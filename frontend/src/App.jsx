import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import PatientLogin from "./pages/auth/PatientLogin";
import PatientRegister from "./pages/auth/PatientRegister";
import HospitalLogin from "./pages/auth/HospitalLogin";
import HospitalRegister from "./pages/auth/HospitalRegister";
import AdminLogin from "./pages/auth/AdminLogin";

import PatientDashboard from "./pages/patient/PatientDashboard";
import BrowseHospitals from "./pages/patient/BrowseHospitals";
import HospitalDetails from "./pages/patient/HospitalDetails";
import MyAppointments from "./pages/patient/MyAppointments";
import PatientProfile from "./pages/patient/PatientProfile";

import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import ManageDoctors from "./pages/hospital/ManageDoctors";
import HospitalAppointments from "./pages/hospital/HospitalAppointments";
import HospitalProfile from "./pages/hospital/HospitalProfile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageHospitals from "./pages/admin/ManageHospitals";
import ManageUsers from "./pages/admin/ManageUsers";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Auth */}
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/register" element={<PatientRegister />} />
          <Route path="/hospital/login" element={<HospitalLogin />} />
          <Route path="/hospital/register" element={<HospitalRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Patient */}
          <Route path="/patient" element={<ProtectedRoute allow={["PATIENT"]}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/hospitals" element={<ProtectedRoute allow={["PATIENT"]}><BrowseHospitals /></ProtectedRoute>} />
          <Route path="/patient/hospitals/:id" element={<ProtectedRoute allow={["PATIENT"]}><HospitalDetails /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute allow={["PATIENT"]}><MyAppointments /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute allow={["PATIENT"]}><PatientProfile /></ProtectedRoute>} />

          {/* Hospital */}
          <Route path="/hospital" element={<ProtectedRoute allow={["HOSPITAL"]}><HospitalDashboard /></ProtectedRoute>} />
          <Route path="/hospital/doctors" element={<ProtectedRoute allow={["HOSPITAL"]}><ManageDoctors /></ProtectedRoute>} />
          <Route path="/hospital/appointments" element={<ProtectedRoute allow={["HOSPITAL"]}><HospitalAppointments /></ProtectedRoute>} />
          <Route path="/hospital/profile" element={<ProtectedRoute allow={["HOSPITAL"]}><HospitalProfile /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allow={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/hospitals" element={<ProtectedRoute allow={["ADMIN"]}><ManageHospitals /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allow={["ADMIN"]}><ManageUsers /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
