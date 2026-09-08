import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function EventDetails() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/events/${id}`
        );

        setEvent(res.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return <p>Loading event details...</p>;
  }

  if (!event) {
    return <p>Event not found.</p>;
  }

  return (
    <div>
      <h1>{event.title}</h1>

      <p>{event.description}</p>

      <p>
        Start Date: {event.startDate}
      </p>

      <p>
        End Date: {event.endDate}
      </p>

      <p>
        Category: {event.category}
      </p>

      <p>
        Location: {event.location || "Not available"}
      </p>

      <p>
        Entry Fee: {event.price > 0 ? `₹${event.price}` : "Free"}
      </p>

      <p>
        Status: {event.status}
      </p>
    </div>
  );
}