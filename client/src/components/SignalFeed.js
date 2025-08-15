import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL;
console.log('API_URL:', API_URL);

export default function SignalFeed({ refreshKey, token }) {
  const [signals, setSignals] = useState([]);

  useEffect(() => {

    if (!token) return;


    // Define fetchSignals here, inside useEffect
    const fetchSignals = async () => {
      try {
        const res = await fetch(`${API_URL}/api/signals`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch signals");
        const data = await res.json();
        setSignals(data);
      } catch (err) {
        console.error("Error fetching signals", err);
        setSignals([]);
      }
    };

    fetchSignals();
  }, [refreshKey, token]); // Only real dependencies

  const getConfidenceColor = (confidenceStr) => {
    const num = parseFloat(confidenceStr.replace("%", ""));
    if (num >= 60) return "text-green-500";
    if (num >= 30) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Trade Signals</h2>
      <ul>
        {signals.map((signal) => (
          <li
            key={signal.id}
            className="flex justify-between py-2 border-b border-gray-700 last:border-b-0"
          >
            <span>{signal.symbol}</span>
            <span
              className={
                signal.type === "Buy"
                  ? "text-green-400 font-semibold"
                  : "text-red-400 font-semibold"
              }
            >
              {signal.type}
            </span>
            <span className={`${getConfidenceColor(signal.confidence)} font-semibold`}>
              {signal.confidence}
            </span>
            <span className="text-gray-400 text-sm">{signal.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
