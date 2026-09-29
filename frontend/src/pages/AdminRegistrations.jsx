import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/admin-dashboard.css";

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalRegistrations: 0,
    totalPages: 1
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 Fetch list of events for the filter dropdown
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/events`)
      .then((res) => {
        const eventList = Array.isArray(res.data) ? res.data : (res.data.events || []);
        setEvents(eventList);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  // 🔄 Fetch paginated registrations
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const params = {
      page,
      limit: 20
    };
    if (selectedEventId) {
      params.eventId = selectedEventId;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/registrations`, { params })
      .then((res) => {
        if (!isMounted) return;
        if (res.data && res.data.registrations) {
          setRegistrations(res.data.registrations);
          setPagination(
            res.data.pagination || {
              page: 1,
              limit: 20,
              totalRegistrations: res.data.registrations.length,
              totalPages: 1
            }
          );
        } else if (Array.isArray(res.data)) {
          // Fallback if backend returned array
          setRegistrations(res.data);
          setPagination({
            page: 1,
            limit: 20,
            totalRegistrations: res.data.length,
            totalPages: 1
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching registrations:", err);
        setError("Failed to load registrations. Please try again.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, selectedEventId]);

  const handleEventFilterChange = (e) => {
    setSelectedEventId(e.target.value);
    setPage(1); // Reset to page 1 on filter change
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-nav-actions">
          <Link to="/admin" className="back-link">
            ← Back to Admin Dashboard
          </Link>
        </div>
        <h1>Event Registrations</h1>
        <p>View and manage all student registrations with server-side pagination</p>
      </div>

      <div className="registrations-section">
        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="event-filter-select">Filter by Event:</label>
            <select
              id="event-filter-select"
              className="filter-select"
              value={selectedEventId}
              onChange={handleEventFilterChange}
            >
              <option value="">🎪 All Events</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading registrations...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="empty-state">
            <p className="error-message">⚠️ {error}</p>
            <button
              className="retry-btn"
              onClick={() => setPage(1)}
              style={{ marginTop: "1rem", padding: "0.5rem 1.2rem" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && registrations.length === 0 && (
          <div className="empty-state">
            <p>No registrations found matching your criteria.</p>
          </div>
        )}

        {/* Registrations Table */}
        {!loading && !error && registrations.length > 0 && (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student / Name</th>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg._id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {(reg.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <span className="user-name">{reg.name || "N/A"}</span>
                        </div>
                      </td>
                      <td className="email-cell">{reg.email || "N/A"}</td>
                      <td>
                        <span className="event-badge">
                          {reg.event?.title || "Unknown Event"}
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(reg.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-bar">
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || loading}
              >
                ← Previous
              </button>

              <span className="pagination-info">
                Page <strong>{pagination.page}</strong> of{" "}
                <strong>{pagination.totalPages || 1}</strong>{" "}
                <span className="total-count">
                  ({pagination.totalRegistrations} total)
                </span>
              </span>

              <button
                className="pagination-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (pagination.totalPages || 1) || loading}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
