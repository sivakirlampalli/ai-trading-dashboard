import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-950 via-slate-900 to-teal-900 flex flex-col justify-center items-center">
      {/* Logo + Branding */}
      <div className="mb-12 flex flex-col items-center space-y-4">
        {/* SVG trading dashboard icon */}
        <span className="h-24 w-24 flex items-center justify-center rounded-full shadow-lg bg-slate-900">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" width="64" height="64">
            <circle cx="32" cy="32" r="32" fill="#22c55e"/>
            <path d="M16 40L28 28L36 36L48 24" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="16" cy="40" r="2.5" fill="#fff"/>
            <circle cx="28" cy="28" r="2.5" fill="#fff"/>
            <circle cx="36" cy="36" r="2.5" fill="#fff"/>
            <circle cx="48" cy="24" r="2.5" fill="#fff"/>
          </svg>
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center leading-tight drop-shadow-lg">
          AI-Powered Trading Dashboard
        </h1>
        <h2 className="text-xl md:text-2xl text-teal-300 font-medium mt-2 text-center">
          Real-Time Market Visualization &amp; Signal Generation
        </h2>
        <p className="text-gray-400 text-center max-w-2xl mt-2">
          Harness state-of-the-art AI for smart signal alerts, live price charts, and seamless portfolio insights—designed for traders, analysts, and investors who want intelligent decisions fast.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="flex flex-col md:flex-row gap-8 my-8 w-full max-w-4xl justify-center items-stretch">
        <div className="bg-slate-800/80 rounded-xl p-6 shadow-lg flex flex-col items-center hover:scale-105 transition">
          <svg width="36" height="36" className="mb-2 text-teal-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 20V10m0 0l-7 7m7-7l7 7M5 3h14v2H5V3z"/>
          </svg>
          <h3 className="text-teal-300 font-semibold text-lg mb-1">Live Candlestick Charts</h3>
          <p className="text-gray-300 text-sm text-center">Visualize market moves, patterns, and trends instantly for stocks, crypto, or your own uploads.</p>
        </div>
        <div className="bg-slate-800/80 rounded-xl p-6 shadow-lg flex flex-col items-center hover:scale-105 transition">
          <svg width="36" height="36" className="mb-2 text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M8 17l4 4 4-4m-4 4V3"/>
          </svg>
          <h3 className="text-green-300 font-semibold text-lg mb-1">Automated AI Signals</h3>
          <p className="text-gray-300 text-sm text-center">Get instant buy/sell alerts powered by cutting-edge machine learning and technical analysis.</p>
        </div>
        <div className="bg-slate-800/80 rounded-xl p-6 shadow-lg flex flex-col items-center hover:scale-105 transition">
          <svg width="36" height="36" className="mb-2 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 8V7a5 5 0 0 0-10 0v1m10 0a5 5 0 0 1 10 0v1m-10 0v8m10-8v8"/>
          </svg>
          <h3 className="text-blue-300 font-semibold text-lg mb-1">Portfolio Integration</h3>
          <p className="text-gray-300 text-sm text-center">Upload custom data, track multiple assets, and monitor your portfolio with ease.</p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mb-2 mt-10 flex gap-x-6 justify-center">
        <button
          className="px-8 py-4 bg-gradient-to-r from-teal-400 to-green-600 rounded-xl text-white text-lg font-bold shadow-md hover:scale-105 transition"
          onClick={() => navigate("/register")}
        >
          Get Started Free
        </button>
        <button
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl text-white text-lg font-bold shadow-md hover:scale-105 transition"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-gray-500 text-xs text-center">
        &copy; {new Date().getFullYear()} AI Trading Dashboard. Powered by React &amp; TailwindCSS.
      </footer>
    </div>
  );
}
