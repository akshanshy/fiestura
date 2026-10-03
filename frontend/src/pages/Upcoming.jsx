import "../styles/upcoming.css";
import { useEffect, useState } from "react";
import axios from "axios";
import EventCard from "../components/EventCard";

export default function Upcoming() {
  const [events, setEvents] = useState([]);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  });

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_API_URL}/events?status=upcoming&page=${page}&limit=12`
      )
      .then((res) => {
        setEvents(res.data.events);
        setPagination(res.data.pagination);
      })
      .catch((err) => console.log(err));
  }, [page]);

  return (
    <div className="container">
      <div className="header">
        <h1>⏳ Upcoming Events</h1>
        <p>Register now and secure your spot!</p>
      </div>

      <div className="events-grid">
        {events.length === 0 ? (
          <p>No upcoming events</p>
        ) : (
          events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 0 && (
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>

          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}