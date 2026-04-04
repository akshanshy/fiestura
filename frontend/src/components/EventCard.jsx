import axios from "axios";
import { useState, useEffect } from "react";
export default function EventCard({ event }) {

    const [isRegistered, setIsRegistered] = useState(false);
    useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  axios
    .get(`${import.meta.env.VITE_API_URL}/registrations/user/${user._id}`)
    .then((res) => {
      const already = res.data.some(
        (r) => r.eventId === event._id
      );
      setIsRegistered(already);
    });
}, [event._id]);

    const cancelRegistration = async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/registrations`, {
      data: {
        userId: user._id,
        eventId: event._id
      }
    });

    alert("Registration cancelled ❌");
    setIsRegistered(false);

  } catch (err) {
    alert(err.response?.data || "Error");
  }
};

  const register = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/registrations`, {
        userId: user._id,
        eventId: event._id,
        name: user.name,
        email: user.email
      });

      alert("Registered successfully 🎉");
    } catch (err) {
      alert(err.response?.data || "Error");
    }
  };

  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p>{new Date(event.date).toDateString()}</p>
      <p>{event.category}</p>

     {isRegistered ? (
  <button
    onClick={cancelRegistration}
    style={{ background: "red", color: "white" }}
  >
    ❌ Cancel Registration
  </button>
) : (
  <button onClick={register}>
    Register
  </button>
)}
    </div>
  );
}