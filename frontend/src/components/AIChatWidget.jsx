
import { useState } from "react";
import axios from "axios";
import "./AIChatWidget.css";

function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    setLoading(true);
    setReply("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/ai/chat",
        { message }
      );

      setReply(response.data.reply);
      setMessage("");
    } catch (error) {
      setReply(
        error.response?.data?.error ||
          "Sorry, the AI assistant is unavailable. Please try again."
      );
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
          AI Assistant
        </button>
      )}

      {isOpen && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <h3>AI-Fiestura</h3>

            <button
              onClick={() => setIsOpen(false)}
              className="ai-chat-close"
              aria-label="Close AI assistant"
            >
              ×
            </button>
          </div>

          <div className="ai-chat-body">
            <div className="ai-chat-reply">
              {reply || "Hi! Ask me to find events for you."}
            </div>

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Ask about events..."
              className="ai-chat-input"
              aria-label="Message for AI-Fiestura"
            />

            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className="ai-chat-send"
            >
              {loading ? "Searching..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIChatWidget;
