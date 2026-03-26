import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/MyRegistrations.css";

export default function MyRegistrations() {
  const [regs, setRegs] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios
      .get(`http://localhost:5000/registrations/user/${user._id}`)
      .then(res => setRegs(res.data));
  }, []);

  const cancelRegistration = async (eventId) => {
    try {
      await axios.delete("http://localhost:5000/registrations", {
        data: {
          userId: user._id,
          eventId
        }
      });

      // 🔥 update UI instantly
      setRegs(prev => prev.filter(r => r.eventId !== eventId));

    } catch (err) {
      alert("Error cancelling");
    }
  };

  return (
    <div className="my-registrations-container">
      <div className="my-registrations-header">
        <h1>🎫 My Registrations</h1>
        <p>Track all your registered events in one place</p>
      </div>

      {/* Stats */}
      {regs.length > 0 && (
        <div className="registrations-stats">
          <div className="stat-item">
            <div className="stat-number">{regs.length}</div>
            <div className="stat-label">Total Registrations</div>
          </div>
        </div>
      )}

      {/* Registrations Grid */}
      {regs.length === 0 ? (
        <div className="registrations-grid">
          <div className="empty-registrations">
            <p>No registrations yet</p>
            <p className="empty-registrations-subtitle">
              Explore events and register for ones that interest you!
            </p>
          </div>
        </div>
      ) : (
        <div className="registrations-grid">
          {regs.map((r) => (
            <div key={r._id} className="registration-card">
              <h3>{r.event?.title}</h3>
              
              <p>{new Date(r.event?.date).toDateString()}</p>
              <p>{r.event?.description}</p>

              <div className="registration-user-info">
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="user-info-text">
                  <h4>{user.name}</h4>
                  <p>{user.email}</p>
                </div>
              </div>

              <button onClick={() => cancelRegistration(r.eventId)}>
                ❌ Cancel Registration
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}