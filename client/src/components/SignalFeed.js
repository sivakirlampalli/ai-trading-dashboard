import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const DEFAULT_SYMBOL = "AAPL"; // or user-selectable

export default function SignalFeed() {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const res = await fetch(`${API_URL}/api/latest-signals?symbol=${DEFAULT_SYMBOL}`);
        if (!res.ok) throw new Error("Failed to fetch signals");
        const data = await res.json();
        setSignals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching live signals", err);
        setSignals([]);
      }
    };
    fetchSignals();
    const interval = setInterval(fetchSignals, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <ul>
        {signals.map((signal, idx) => (
          <li key={idx}>
            {signal.type} ({signal.confidence}%) at {signal.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}
