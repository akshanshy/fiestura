import { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/past.css'

const API = 'http://localhost:5000/api'

export default function Past() {
  const [events, setEvents] = useState([])
  const [selectedYear, setSelectedYear] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get(`${API}/events`)
      .then((res) => {
        const pastEvents = res.data.filter(
          (event) => event.status === 'past'
        )

        setEvents(pastEvents)
      })
      .catch((error) => {
        console.error('Error fetching past events:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const filteredEvents =
    selectedYear === 'all'
      ? events
      : events.filter((event) => {
          const eventYear = new Date(event.startDate).getFullYear()
          return eventYear.toString() === selectedYear
        })

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return <p>Loading past events...</p>
  }

  return (
    <div>
      <div className="header">
        <h1>
          <i className="fas fa-history"></i> Past Events
        </h1>
        <p>Relive the amazing moments and achievements!</p>
      </div>

      <div className="timeline-filter">
        <button
          className={`timeline-btn ${
            selectedYear === 'all' ? 'active' : ''
          }`}
          onClick={() => setSelectedYear('all')}
        >
          All Years
        </button>

        <button
          className={`timeline-btn ${
            selectedYear === '2025' ? 'active' : ''
          }`}
          onClick={() => setSelectedYear('2025')}
        >
          2025
        </button>

        <button
          className={`timeline-btn ${
            selectedYear === '2024' ? 'active' : ''
          }`}
          onClick={() => setSelectedYear('2024')}
        >
          2024
        </button>
      </div>

      <div className="events-grid">
        {filteredEvents.length === 0 ? (
          <p>No past events found.</p>
        ) : (
          filteredEvents.map((event) => (
            <div className="event-card" key={event._id}>
              <div className="event-header">
                <div className="completed-badge">
                  <i className="fas fa-check-circle"></i> COMPLETED
                </div>

                <h3 className="event-title">{event.title}</h3>

                <div>
                  <i className="fas fa-calendar"></i>{' '}
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </div>

                <div>
                  <i className="fas fa-map-marker-alt"></i>{' '}
                  {event.location}
                </div>
              </div>

              <div className="event-content">
                <p className="event-description">
                  {event.description}
                </p>

                {event.image && (
                  <div className="gallery-preview">
                    <div className="gallery-item">
                      <img
                        src={event.image}
                        alt={event.title}
                      />
                    </div>
                  </div>
                )}

                <div className="action-buttons">
                  <button
                    className="btn btn-gallery"
                    onClick={() => alert('Gallery coming soon')}
                  >
                    <i className="fas fa-images"></i> View Gallery
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        window.location.href
                      )
                      alert('Event link copied')
                    }}
                  >
                    <i className="fas fa-share"></i> Share
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}