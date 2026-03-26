import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Home from './pages/Home.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Registration from './pages/Registration.jsx'
import Ongoing from './pages/Ongoing.jsx'
import Upcoming from './pages/Upcoming.jsx'
import Past from './pages/Past.jsx'
import AdminDashboard from "./pages/AdminDashboard";
import MyRegistrations from "./pages/MyRegistrations.jsx";

import ProtectedRoute from "./components/ProtectedRoute";

function useBodyPageClass() {
  const location = useLocation()
  //const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    const path = location.pathname
    const pageClass =
      path === '/'
        ? 'page-home'
        : path === '/contact'
          ? 'page-contact'
          : path === '/login'
            ? 'page-login'
            : path === '/signup'
              ? 'page-signup'
              : path === '/registration'
                ? 'page-registration'
                : path === '/ongoing'
                  ? 'page-ongoing'
                  : path === '/upcoming'
                    ? 'page-upcoming'
                    : path === '/past'
                      ? 'page-past'
                      : null

    document.body.classList.remove(
      'page-home',
      'page-contact',
      'page-login',
      'page-signup',
      'page-registration',
      'page-ongoing',
      'page-upcoming',
      'page-past'
    )
    if (pageClass) document.body.classList.add(pageClass)
  }, [location.pathname])
}

export default function App() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return <AppRoutes user={user} />;
}
function AppRoutes({ user }) {
  useBodyPageClass();

  return (
    <Routes>

      <Route path="/" element={<Home />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/my-registrations" element={<MyRegistrations />} />

      {/* 🔐 ADMIN ROUTE */}
      <Route
        path="/admin"
        element={
          user?.role === "admin"
            ? <AdminDashboard />
            : <Navigate to="/login" />
        }
      />

      {/* 🔒 PROTECTED ROUTES */}
      <Route path="/registration" element={<ProtectedRoute><Registration /></ProtectedRoute>} />
      <Route path="/ongoing" element={<ProtectedRoute><Ongoing /></ProtectedRoute>} />
      <Route path="/upcoming" element={<ProtectedRoute><Upcoming /></ProtectedRoute>} />
      <Route path="/past" element={<ProtectedRoute><Past /></ProtectedRoute>} />

      {/* redirects */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}
