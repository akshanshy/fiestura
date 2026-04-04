import '../styles/ongoing.css'
import { useEffect, useState } from 'react'
import axios from 'axios'
import EventCard from "../components/EventCard";

function sharePage() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      text: 'Check out this amazing event!',
      url: window.location.href
    }).catch(() => {})
  } else {
    alert('Sharing not supported on this browser.')
  }
}

export default function Ongoing() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/events?category=ongoing`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.log(err))
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen?.()
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🔥 Ongoing Events</h1>
        <p>Join the action happening right now!</p>
      </div>

      {/* ✅ USE REUSABLE COMPONENT */}
      <div className="events-grid">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>

      <div className="floating-actions">
        <button className="floating-btn" onClick={() => location.reload()}>
          🔄
        </button>
        <button className="floating-btn" onClick={() => alert('Notifications coming soon')}>
          🔔
        </button>
        <button className="floating-btn" onClick={toggleFullscreen}>
          ⛶
        </button>
      </div>
    </div>
  )
}