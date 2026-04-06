import axios from "axios";
import { useState, useEffect } from "react";
import useRazorpay from "../hooks/useRazorpay";

export default function EventCard({ event }) {
  const [isRegistered, setIsRegistered] = useState(false);
  const { pay, loading } = useRazorpay();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    axios
      .get(`${import.meta.env.VITE_API_URL}/registrations/user/${user._id}`)
      .then((res) => {
        const already = res.data.some((r) => r.eventId === event._id);
        setIsRegistered(already);
      });
  }, [event._id]);

  const cancelRegistration = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/registrations`, {
        data: {
          userId: user._id,
          eventId: event._id,
        },
      });

      alert("Registration cancelled ❌");
      setIsRegistered(false);
    } catch (err) {
      alert(err.response?.data || "Error");
    }
  };

  // Register the user (called after payment or directly for free events)
  const registerUser = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/registrations`, {
        userId: user._id,
        eventId: event._id,
        name: user.name,
        email: user.email,
      });

      alert("Registered successfully 🎉");
      setIsRegistered(true);
    } catch (err) {
      alert(err.response?.data || "Error");
    }
  };

  const handleRegister = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first");
      return;
    }

    const price = event.price || 0;

    // ── Free event → register directly ──
    if (price === 0) {
      await registerUser();
      return;
    }

    // ── Paid event → Razorpay → then register ──
    pay({
      amount: price,
      userId: user._id,
      eventId: event._id,
      userName: user.name,
      userEmail: user.email,
      onSuccess: async () => {
        await registerUser();
      },
      onFailure: (msg) => {
        alert(`Payment failed: ${msg}`);
      },
    });
  };

  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p>{new Date(event.date).toDateString()}</p>
      <p>{event.category}</p>

      {/* Price badge */}
      {event.price > 0 && (
        <p className="price-badge">₹{event.price}</p>
      )}

      {isRegistered ? (
        <button
          onClick={cancelRegistration}
          style={{ background: "red", color: "white" }}
        >
          ❌ Cancel Registration
        </button>
      ) : (
        <button onClick={handleRegister} disabled={loading}>
          {loading
            ? "Processing..."
            : event.price > 0
              ? `Pay ₹${event.price} & Register`
              : "Register"}
        </button>
      )}
    </div>
  );
}