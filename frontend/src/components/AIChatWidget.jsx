
import { useState } from "react";
import axios from "axios";

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
    <div
  style={{
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 99999,
    backgroundColor: "#4f46e5",
    padding: "16px",
    borderRadius: "12px",
    color: "white",
  }}
>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-indigo-600 px-5 py-3 text-white shadow-lg"
        >
          AI Assistant
        </button>
      )}

      {isOpen && (
        <div className="w-80 overflow-hidden rounded-xl border bg-white shadow-xl">
          <div className="flex items-center justify-between bg-indigo-600 p-4 text-white">
            <h3 className="font-semibold">AI-Fiestura</h3>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close AI assistant"
            >

            </button>
          </div>

          <div className="space-y-3 p-4">
            <div className="max-h-60 overflow-y-auto text-sm text-gray-700">
              {reply || "Hi! Ask me to find events for you."}
            </div>

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Ask about events..."
              className="w-full rounded-lg border p-2 text-sm text-gray-900"
            />

            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className="w-full rounded-lg bg-indigo-600 p-2 text-white disabled:opacity-50"
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
