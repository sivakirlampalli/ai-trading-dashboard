export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 text-gray-200 min-h-screen flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        TradeDash
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <a href="#" className="block p-2 rounded hover:bg-gray-700">📊 Dashboard</a>
        <a href="#" className="block p-2 rounded hover:bg-gray-700">📈 Signals</a>
        <a href="#" className="block p-2 rounded hover:bg-gray-700">🔔 Alerts</a>
        <a href="#" className="block p-2 rounded hover:bg-gray-700">⚙ Settings</a>
      </nav>
    </div>
  );
}
