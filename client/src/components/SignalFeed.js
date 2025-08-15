import React, { useState, useEffect } from "react";

export default function SignalFeed({ refreshKey }) {
  const [signals, setSignals] = useState([]);

  const fetchSignals = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/signals", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setSignals(data);
  };

  useEffect(() => {
    fetchSignals();
  }, [refreshKey]);

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
