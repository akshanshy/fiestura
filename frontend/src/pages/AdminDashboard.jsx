import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/admin-dashboard.css";

export default function AdminDashboard() {
  const [search, setSearch] = useState("");

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Choose an area to manage</p>
      </div>

      <div className="admin-stats">
        <Link to="/admin/events" className="stat-card events clickable">
          <div className="stat-icon">🎪</div>
          <div className="stat-number">Events</div>
          <div className="stat-label">Manage Events →</div>
        </Link>

        <Link to="/admin/registrations" className="stat-card registrations clickable">
          <div className="stat-icon">📋</div>
          <div className="stat-number">Registrations</div>
          <div className="stat-label">View Registrations →</div>
        </Link>
      </div>
    </div>
  );
}
