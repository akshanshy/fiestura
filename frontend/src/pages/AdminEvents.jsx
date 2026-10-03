import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/admin-dashboard.css";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    category: "",
    price: ""
  });
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");

  const formatDate = (date) => {
    if (!date) return "Date not available";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return "Date not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Helper to safely convert Date / ISO string to YYYY-MM-DD for <input type="date" />
  const toDateInputValue = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 🔄 Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/events`);
      // Handle both array responses and object responses ({ events: [...] })
      const eventList = Array.isArray(res.data) ? res.data : (res.data.events || []);
      setEvents(eventList);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✍️ Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ➕ Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🗓️ Date range validation
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (end < start) {
        alert("⚠️ End Date cannot be earlier than Start Date!");
        return;
      }
    }

    try {
      if (editId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/events/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEditId(null);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/events`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setForm({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        category: "",
        price: "",
        capacity: ""
      });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving event");
    }
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting event");
    }
  };

  // ✏️ Edit
  const handleEdit = (event) => {
    setForm({
      title: event.title,
      description: event.description,
      startDate: toDateInputValue(event.startDate),
      endDate: toDateInputValue(event.endDate),
      category: event.category,
      price: event.price || "",
      capacity: event.capacity || ""
    });
    setEditId(event._id);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-nav-actions">
          <Link to="/admin" className="back-link">
            ← Back to Admin Dashboard
          </Link>
        </div>
        <h1>Manage Events</h1>
        <p>Create, update, and manage events</p>
      </div>

      {/* Event Form */}
      <div className="admin-form-section">
        <h2>{editId ? "Edit Event" : "Add New Event"}</h2>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Annual Tech Symposium"
              required
            />
          </div>

          <div className="form-group">
            <label>Event Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief summary of event..."
              required
            />
          </div>

          <div className="form-group">
            <label>Start Date 📅</label>
            <input
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date 📅</label>
            <input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              min={form.startDate || undefined}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Workshop">Workshop</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price (₹)</label>
            <input
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={handleChange}
              placeholder="0 = Free"
            />
          </div>

          <div className="form-group">
  <label>Capacity</label>
  <input
    name="capacity"
    type="number"
    min="1"
    value={form.capacity}
    onChange={handleChange}
    placeholder="Maximum participants"
    required
  />
</div>

          <div className="form-actions full-width">
            <button type="submit">
              {editId ? "✏️ Update Event" : "➕ Add Event"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setForm({
                    title: "",
                    description: "",
                    startDate: "",
                    endDate: "",
                    category: "",
                    price: "",
                    capacity: ""
                  });
                }}
              >
                Cancel
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
                  <span className="date">
             {formatDate(event.startDate)} - {formatDate(event.endDate)}
                 </span>
                  <span className="category">{event.category}</span>
                  <span className="price">{event.price > 0 ? `₹${event.price}` : "Free"}</span>
                </div>
                <p>{event.description}</p>
                <div className="card-actions">
                  <button className="edit" onClick={() => handleEdit(event)}>
                     Edit
                  </button>
                  <button className="delete" onClick={() => handleDelete(event._id)}>
                     Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}