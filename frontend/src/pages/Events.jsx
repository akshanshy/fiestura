import { useEffect, useState } from "react";
import axios from "axios";

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/events")
      .then(res => setEvents(res.data));
  }, []);

  return (
    <div>
      {events.map(e => (
        <div key={e._id}>
          <h2>{e.title}</h2>
          <p>{e.description}</p>
        </div>
      ))}
    </div>
  );
}