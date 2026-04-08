import { useEffect, useState } from "react";

const POLL_INTERVAL = 3000;

const ShortPolling = () => {
  const [data, setData] = useState(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const fetchData = () => {
      fetch("http://localhost:5000/api/v1/playground/data")
        .then((res) => res.json())
        .then((json) => setData(json))
        .catch((err) => console.error("Short poll error:", err));
    };

    fetchData(); // immediate first call
    const interval = setInterval(fetchData, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold">Short Polling</h2>
      <p className="text-sm text-gray-500">
        Client repeatedly requests data every {POLL_INTERVAL / 1000}s regardless
        of whether new data exists.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => setIsActive(true)}
          disabled={isActive}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Start Polling
        </button>
        <button
          onClick={() => { setIsActive(false); setData(null); }}
          disabled={!isActive}
          className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
        >
          Stop
        </button>
      </div>

      {data && (
        <div className="bg-gray-100 rounded p-4 font-mono text-sm">
          <p>Counter: <span className="font-bold">{data.value}</span></p>
          <p>Time: {new Date(data.time).toLocaleTimeString()}</p>
        </div>
      )}

      {!data && <p className="text-gray-400 text-sm">No data yet. Start polling.</p>}
    </div>
  );
};

export default ShortPolling;
