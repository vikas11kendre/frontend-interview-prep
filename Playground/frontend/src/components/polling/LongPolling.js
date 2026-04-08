import { useEffect, useRef, useState } from "react";

const LongPolling = () => {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const activeRef = useRef(false);

  const startListening = () => {
    activeRef.current = true;
    setIsListening(true);
    poll();
  };

  const stopListening = () => {
    activeRef.current = false;
    setIsListening(false);
  };

  const poll = () => {
    if (!activeRef.current) return;

    fetch("http://localhost:5000/api/v1/playground/long-poll")
      .then((res) => res.json())
      .then((data) => {
        setMessages((prev) => [
          { ...data, receivedAt: new Date().toLocaleTimeString() },
          ...prev.slice(0, 9), // keep last 10
        ]);
        if (activeRef.current) poll(); // re-connect immediately
      })
      .catch(() => {
        if (activeRef.current) setTimeout(poll, 2000); // retry on error
      });
  };

  const triggerUpdate = () => {
    setIsSending(true);
    fetch("http://localhost:5000/api/v1/playground/long-poll/update")
      .then((res) => res.text())
      .catch((err) => console.error("Trigger error:", err))
      .finally(() => setIsSending(false));
  };

  // cleanup on unmount
  useEffect(() => {
    return () => { activeRef.current = false; };
  }, []);

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold">Long Polling</h2>
      <p className="text-sm text-gray-500">
        Client holds an open request until the server has new data, then
        immediately reconnects.
      </p>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={startListening}
          disabled={isListening}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          Start Listening
        </button>
        <button
          onClick={stopListening}
          disabled={!isListening}
          className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
        >
          Stop
        </button>
        <button
          onClick={triggerUpdate}
          disabled={isSending}
          className="px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-50"
        >
          {isSending ? "Sending..." : "Push Update from Server"}
        </button>
      </div>

      <div className="space-y-1">
        {isListening && messages.length === 0 && (
          <p className="text-blue-500 text-sm animate-pulse">
            Waiting for server update...
          </p>
        )}
        {!isListening && messages.length === 0 && (
          <p className="text-gray-400 text-sm">Not listening. Click Start.</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="bg-gray-100 rounded p-3 font-mono text-sm">
            <p>{msg.message}</p>
            <p className="text-gray-500 text-xs">
              Server time: {new Date(msg.time).toLocaleTimeString()} · Received: {msg.receivedAt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LongPolling;
