import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL;
console.log('API_URL:', API_URL); 

export default function Alerts({ refreshKey, token }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!token) return;
    
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/alerts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setAlerts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [refreshKey, token]);

  if (loading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Alerts</h2>
        <p className="text-gray-400">Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Alerts</h2>
      {alerts.length === 0 ? (
        <p className="text-gray-400">No alerts available.</p>
      ) : (
        <ul>
          {alerts.map((alert, idx) => (
            <li key={idx} className="py-2 border-b border-gray-700 last:border-b-0 text-yellow-400">
              {alert}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
