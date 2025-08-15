import React, { useState, useEffect } from "react";

export default function Alerts({ refreshKey }) {
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/alerts");
    const data = await res.json();
    setAlerts(data);
  };

  useEffect(() => {
    fetchAlerts();
  }, [refreshKey]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Alerts</h2>
      <ul>
        {alerts.map((alert, i) => (
          <li key={i} className="py-2 border-b border-gray-700 last:border-b-0">
            {alert}
          </li>
        ))}
      </ul>
    </div>
  );
}
