import React, { useContext, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChartPanel from "./components/ChartPanel";
import SignalFeed from "./components/SignalFeed";
import Alerts from "./components/Alerts";
import Login from "./components/Login";
import Register from "./components/Register";
import { AuthContext, AuthProvider } from "./AuthContext";

function DashboardContent({ token, logout, refreshKey, handleDataUpdated }) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-4 space-y-4">
        <button onClick={logout} className="mb-4 px-4 py-2 bg-red-600 rounded">
          Logout
        </button>
        <ChartPanel onDataUpdated={handleDataUpdated} token={token} refreshKey={refreshKey} />
        <SignalFeed refreshKey={refreshKey} token={token} />
        <Alerts refreshKey={refreshKey} token={token} />
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
