import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/admin-dashboard.css";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    category: ""
  });

  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");
  console.log("TOKEN:", token);

  // 🔄 Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/events");
      setEvents(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Fetch registrations
  const fetchRegistrations = async () => {
    const res = await axios.get("http://localhost:5000/registrations");
    setRegistrations(res.data);
  };

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
  }, []);

  // 🔍 FILTER LOGIC
  const filteredRegistrations = registrations.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());

    const matchEvent =
      !eventFilter || r.event?.title === eventFilter;

    return matchSearch && matchEvent;
  });

  // ✍️ Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ➕ Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      await axios.put(`http://localhost:5000/events/${editId}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditId(null);
    } else {
      await axios.post("http://localhost:5000/events", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    setForm({ title: "", description: "", date: "", category: "" });
    fetchEvents();
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchEvents();
  };

  // ✏️ Edit
  const handleEdit = (event) => {
    setForm({
      title: event.title,
      description: event.description,
      date: event.date?.split("T")[0],
      category: event.category
    });
    setEditId(event._id);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage events and view registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card events">
          <div className="stat-icon">🎪</div>
          <div className="stat-number">{events.length}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card registrations">
          <div className="stat-icon">👥</div>
          <div className="stat-number">{registrations.length}</div>
          <div className="stat-label">Total Registrations</div>
        </div>
      </div>

      {/* Event Form */}
      <div className="admin-form-section">
        <h2>{editId ? "Edit Event" : "Add New Event"}</h2>
        <form className="admin-form" onSubmit={handleSubmit}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Event Title"
            required
          />
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Event Description"
            required
          />
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="ongoing">Ongoing</option>
            <option value="upcoming">Upcoming</option>
          </select>
          <div className="form-actions">
            <button type="submit">
              {editId ? "✏️ Update Event" : "➕ Add Event"}
            </button>
            {editId && (
              <button type="button" onClick={() => {
                setEditId(null);
                setForm({ title: "", description: "", date: "", category: "" });
              }}>
                ❌ Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Events List */}
      <div className="events-section">
        <h2>Manage Events</h2>
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <p>No events found. Create your first event above!</p>
          </div>
        ) : (
          <div className="event-list">
            {events.map((event) => (
              <div key={event._id} className="event-card">
                <h3>{event.title}</h3>
                <div className="event-meta">
                  <span className="date">{new Date(event.date).toLocaleDateString()}</span>
                  <span className="category">{event.category}</span>
                </div>
                <p>{event.description}</p>
                <div className="card-actions">
                  <button className="edit" onClick={() => handleEdit(event)}>
                    ✏️ Edit
                  </button>
                  <button className="delete" onClick={() => handleDelete(event._id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registrations Section */}
      <div className="registrations-section">
        <h2>Event Registrations</h2>

        {/* Filters */}
        <div className="filters">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="filter-select"
            onChange={(e) => setEventFilter(e.target.value)}
          >
            <option value="">🎪 All Events</option>
            {events.map((event) => (
              <option key={event._id} value={event.title}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {/* Registrations List */}
        {filteredRegistrations.length === 0 ? (
          <div className="empty-state">
            <p>No registrations found matching your criteria.</p>
          </div>
        ) : (
          <div className="registrations-list">
            {filteredRegistrations.map((registration) => (
              <div key={registration._id} className="registration-card">
                <div className="user-info">
                  <div className="user-avatar">
                    {registration.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <h4>{registration.name}</h4>
                    <p>{registration.email}</p>
                  </div>
                </div>
                <div className="event-info">
                  Registered for: {registration.event?.title || 'Unknown Event'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}