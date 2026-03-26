import { useState } from "react";
import axios from "axios";

export default function AdminAddEvent() {
  const [event, setEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    image: ""
  });

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post("http://localhost:5000/events", event);

    alert("Event Added ✅");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" onChange={handleChange} />
      <input name="description" placeholder="Description" onChange={handleChange} />
      <input name="date" type="date" onChange={handleChange} />
      <input name="location" placeholder="Location" onChange={handleChange} />
      <input name="category" placeholder="Category" onChange={handleChange} />
      <input name="image" placeholder="Image URL" onChange={handleChange} />

      <button type="submit">Add Event</button>
    </form>
  );
}