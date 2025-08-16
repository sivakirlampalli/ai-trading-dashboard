import React, { useContext, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChartPanel from "./components/ChartPanel";
import LiveChartPanel from "./components/LiveChartPanel";
import SignalFeed from "./components/SignalFeed";
import Alerts from "./components/Alerts";
import Login from "./components/Login";
import Register from "./components/Register";
import { AuthContext, AuthProvider } from "./AuthContext";
import DataSelector from "./components/DataSelector";

function SignalsPanel({ token, dataSource, symbol }) {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    if (!symbol || !(dataSource === "stocks" || dataSource === "crypto")) {
      setSignals([]);
      return;
    }
    async function fetchSignals() {
      const res = await fetch(`/api/live-signals?symbol=${symbol}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setSignals(data);
    }
    fetchSignals();
  }, [symbol, dataSource, token]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-2">Trade Signals</h3>
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

function DashboardContent({ token, logout, refreshKey, handleDataUpdated }) {
  const [dataSource, setDataSource] = useState("csv");
  const [symbol, setSymbol] = useState("");

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-4 space-y-4">
        <button onClick={logout} className="mb-4 px-4 py-2 bg-red-600 rounded">
          Logout
        </button>

        <DataSelector
          onSourceChange={(source) => {
            setDataSource(source);
            setSymbol("");
          }}
          onSymbolChange={setSymbol}
        />

        {/* CSV upload chart and signals */}
        {dataSource === "csv" && (
          <>
            <ChartPanel
              onDataUpdated={handleDataUpdated}
              token={token}
              refreshKey={refreshKey}
            />
            <SignalFeed refreshKey={refreshKey} token={token} />
          </>
        )}

        {/* Live API chart and signals */}
        {(dataSource === "stocks" || dataSource === "crypto") && symbol && (
          <>
            <LiveChartPanel dataSource={dataSource} symbol={symbol} token={token} />

          </>
        )}

        
      </main>
    </div>
  );
}


function AppContent() {
  const { token, logout } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          token ? (
            <DashboardContent
              token={token}
              logout={logout}
              refreshKey={refreshKey}
              handleDataUpdated={handleDataUpdated}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
