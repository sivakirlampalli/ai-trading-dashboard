import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export default function SignalsPanel({ token, dataSource, symbol }) {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    if (!symbol || !(dataSource === "stocks" || dataSource === "crypto")) {
      setSignals([]);
      return;
    }
    async function fetchSignals() {
      const res = await fetch(`${API_URL}/api/live-signals?symbol=${symbol}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setSignals(data);
    }
    fetchSignals();
  }, [symbol, dataSource, token]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      
      {signals.length === 0 ? (
        <p>No signals available.</p>
      ) : (
        <ul>
          {signals.map((s, i) => (
            <li key={i}>
              {s.timestamp}: {s.type.toUpperCase()} (Confidence: {s.confidence}%)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
