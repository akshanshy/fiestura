
import { useState } from "react";

function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
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
              className="text-xl"
              aria-label="Close AI assistant"
            >
              ×
            </button>
          </div>

          <div className="p-5 text-sm text-gray-600">
            Hi! Ask me to find events for you.
          </div>
        </div>
      )}
    </div>
  );
}

export default AIChatWidget;
