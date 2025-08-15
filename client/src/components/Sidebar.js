export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 text-gray-200 min-h-screen flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        TradeDash
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <button className="block w-full text-left p-2 rounded hover:bg-gray-700">
          📊 Dashboard
        </button>
        <button className="block w-full text-left p-2 rounded hover:bg-gray-700">
          📈 Signals
        </button>
        <button className="block w-full text-left p-2 rounded hover:bg-gray-700">
          🔔 Alerts
        </button>
        <button className="block w-full text-left p-2 rounded hover:bg-gray-700">
          ⚙ Settings
        </button>
      </nav>
    </div>
  );
}
