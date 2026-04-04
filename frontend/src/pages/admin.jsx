import { useState, useEffect } from "react";
import axios from "axios";

export default function Admin() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    category: "ongoing",
  });

  const [events, setEvents] = useState([]);

  // 🔥 Fetch events
  const fetchEvents = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/events`)
      .then((res) => setEvents(res.data));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 🔄 Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ➕ Add event
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/events`, form);
      alert("Event added ✅");

      fetchEvents(); // 🔥 refresh list

      setForm({
        title: "",
        description: "",
        date: "",
        category: "ongoing",
      });
    } catch (err) {
      alert("Error adding event");
    }
  };

  // ❌ Delete event
  const handleDelete = async (id) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/events/${id}`);
    fetchEvents(); // refresh
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Event</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        <select name="category" value={form.category} onChange={handleChange}>
          <option value="ongoing">Ongoing</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>

        <button type="submit">Add Event</button>
      </form>

      {/* 🔥 SHOW EVENTS */}
      <h2 style={{ marginTop: 30 }}>All Events</h2>

      {events.map((event) => (
        <div key={event._id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <p>{new Date(event.date).toDateString()}</p>
          <p><strong>{event.category}</strong></p>

          <button onClick={() => handleDelete(event._id)}>
            Delete ❌
          </button>
        </div>
      ))}
    </div>
  );
}