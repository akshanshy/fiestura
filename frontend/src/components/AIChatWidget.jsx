
import { useState } from "react";
import axios from "axios";
import "./AIChatWidget.css";

function EventCard({ event }) {
  const price = Number(event.price ?? 0);

  return (
    <div className="ai-event-card">
      <div className="ai-event-card-top">
        <span className="ai-event-category">
          {event.category || "Event"}
        </span>

        <span
          className={`ai-event-status ${(
            event.status || "upcoming"
          ).toLowerCase()}`}
        >
          {event.status || "Upcoming"}
        </span>
      </div>

      <h4>{event.title}</h4>

      <p className="ai-event-description">
        {event.description}
      </p>

      <div className="ai-event-details">
        <span>📍 {event.location || "Location not specified"}</span>
        <span>
          📅 {event.startDate
            ? new Date(event.startDate).toLocaleDateString("en-IN")
            : "Date unavailable"}
        </span>
      </div>

      <div className="ai-event-price">
        {price === 0 ? "Free" : `₹${price}`}
      </div>
    </div>
  );
}

function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      reply: "Hi! I'm AI-Fiestura. Ask me to discover events, workshops or competitions.",
      events: [],
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const userMessage = message.trim();

    if (!userMessage || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", reply: userMessage, events: [] },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/ai/chat",
        { message: userMessage }
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          reply: response.data.reply || "I couldn't generate a response.",
          events: Array.isArray(response.data.events)
            ? response.data.events
            : [],
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          reply:
            error.response?.data?.error ||
            "Sorry, the AI assistant is unavailable. Please try again.",
          events: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-widget">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="ai-chat-toggle"
        >
          ✨ AI Assistant
        </button>
      )}

      {isOpen && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div>
              <h3>AI-Fiestura</h3>
              <span>Your event discovery assistant</span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="ai-chat-close"
              aria-label="Close AI assistant"
            >
              ×
            </button>
          </div>

          <div className="ai-chat-body">
            <div className="ai-chat-messages">
              {messages.map((item, index) => (
                <div
                  key={index}
                  className={`ai-message ${item.role}`}
                >
                  <div className="ai-message-bubble">
                    {item.reply}
                  </div>

                  {item.events.length > 0 && (
                    <div className="ai-event-list">
                      {item.events.map((event, eventIndex) => (
                        <EventCard
                          key={event._id || event.id || eventIndex}
                          event={event}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="ai-message assistant">
                  <div className="ai-message-bubble ai-loading">
                    <span></span>
                    <span></span>
                    <span></span>
                    Searching events...
                  </div>
                </div>
              )}
            </div>

            <div className="ai-chat-input-area">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask about events..."
                className="ai-chat-input"
                aria-label="Message for AI-Fiestura"
                disabled={loading}
              />

              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className="ai-chat-send"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIChatWidget;
