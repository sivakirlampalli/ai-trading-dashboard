import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChartPanel from "./components/ChartPanel";
import SignalFeed from "./components/SignalFeed";
import Alerts from "./components/Alerts";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-4 space-y-4">
        <ChartPanel onDataUpdated={handleDataUpdated} />
        <SignalFeed refreshKey={refreshKey} />
        <Alerts refreshKey={refreshKey} />
      </main>
    </div>
  );
}
