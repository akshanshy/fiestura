import { useState } from "react";
import axios from "axios";

export default function AdminAddEvent() {
  const [event, setEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    category: "",
    image: "",
    price: "",
    capacity: "",
  });

  const handleChange = (e) => {
    setEvent({
      ...event,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/events`,
        event,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Event Added ✅");

      setEvent({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
        category: "",
        image: "",
        price: "",
        capacity: "",
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Error adding event"
      );

      console.error(err.response?.data || err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        placeholder="Title"
        value={event.title}
        onChange={handleChange}
        required
      />

      <input
        name="description"
        placeholder="Description"
        value={event.description}
        onChange={handleChange}
        required
      />

      <label>Start Date</label>
      <input
        name="startDate"
        type="date"
        value={event.startDate}
        onChange={handleChange}
        required
      />

      <label>End Date</label>
      <input
        name="endDate"
        type="date"
        value={event.endDate}
        onChange={handleChange}
        min={event.startDate || undefined}
        required
      />

      <input
        name="location"
        placeholder="Location"
        value={event.location}
        onChange={handleChange}
      />

      <select
        name="category"
        value={event.category}
        onChange={handleChange}
        required
      >
        <option value="">Select Category</option>
        <option value="Technical">Technical</option>
        <option value="Cultural">Cultural</option>
        <option value="Sports">Sports</option>
        <option value="Workshop">Workshop</option>
      </select>

      <input
        name="image"
        placeholder="Image URL"
        value={event.image}
        onChange={handleChange}
      />

      <input
        name="price"
        type="number"
        min="0"
        placeholder="Price (₹)"
        value={event.price}
        onChange={handleChange}
      />

      <input
        name="capacity"
        type="number"
        min="1"
        step="1"
        placeholder="Maximum participants"
        value={event.capacity}
        onChange={handleChange}
        required
      />

      <button type="submit">
        Add Event
      </button>
    </form>
  );
}