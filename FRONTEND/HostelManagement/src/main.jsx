import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { AuthProvider } from "./context/AuthContext";

import {
  Route,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements
} from 'react-router-dom';

import Layout from './Layout.jsx';
import AuthPage from "./pages/auth/AuthPage.jsx";
import Landing from "./pages/Landing";

//  Admin Imports
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import Applications from "./pages/admin/Applications.jsx";
import Students from "./pages/admin/Students.jsx"
import AdminAllotment from "./pages/admin/Allotment.jsx";

//  Student Imports
import StudentLayout from "./layouts/StudentLayout.jsx";
import Dashboard from "./pages/student/Dashboard.jsx";
import StudentAllotment from "./pages/student/Allotment.jsx";
import Application from "./pages/student/Application.jsx";
import RoomChange from "./pages/student/RoomChange.jsx";
import Documents from "./pages/student/Documents.jsx";
import Complaints from "./pages/student/Complaints.jsx";
import Notifications from "./pages/student/Notifications.jsx";
import Profile from "./pages/student/Profile.jsx";
import MyRequests from "./pages/student/MyRequests.jsx";

//  Protected Route
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>

      {/* Landing Page */}
      <Route index element={<Landing />} />

      {/* Auth */}
      <Route path="auth" element={<AuthPage />} />

      {/* Admin */}
      <Route
        path="admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="applications" element={<Applications />} />
        <Route path="students" element={<Students />} />
        <Route path="allotment" element={<AdminAllotment />} />
      </Route>

      {/* Student */}
      <Route
        path="student"
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="application" element={<Application />} />
        <Route path="allotment" element={<StudentAllotment />} />
        <Route path="room-change" element={<RoomChange />} />
        <Route path="documents" element={<Documents />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="my-requests" element={<MyRequests />} />
      </Route>

    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);