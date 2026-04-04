import '../styles/upcoming.css'
import { useEffect, useState } from 'react'
import axios from 'axios'
import EventCard from "../components/EventCard";

export default function Upcoming() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/events?category=upcoming`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.log(err))
  }, [])

  return (
    <div className="container">
      <div className="header">
        <h1>⏳ Upcoming Events</h1>
        <p>Register now and secure your spot!</p>
      </div>

      {/* ✅ DYNAMIC EVENTS */}
      <div className="events-grid">
        {events.length === 0 ? (
          <p>No upcoming events</p>
        ) : (
          events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))
        )}
      </div>
    </div>
  )
}