import React, { useEffect, useRef } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import CsvUpload from "./CsvUpload";

const API_URL = process.env.REACT_APP_API_URL;
console.log('API_URL:', API_URL); 

export default function ChartPanel({ onDataUpdated, token, refreshKey }) {
  const chartContainerRef = useRef();
  const candleSeriesRef = useRef();

  useEffect(() => {
    if (!token) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: { backgroundColor: "#1e293b", textColor: "#d1d5db" },
      grid: {
        vertLines: { color: "#334155" },
        horzLines: { color: "#334155" },
      },
      crosshair: { mode: 1 },
      priceScale: { borderColor: "#475569" },
      timeScale: {
        borderColor: "#475569",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    });

    const fetchChartData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/chart-data`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("API error: " + res.status);
        const data = await res.json();
        if (candleSeriesRef.current && data.length > 0) {
          candleSeriesRef.current.setData(data);
        }
        // Do NOT call onDataUpdated here! Only trigger it on CSV upload.
      } catch (err) {
        alert("ERROR: Failed to fetch chart data. Check API URL, backend status, and CORS settings!");
      }
    };

    fetchChartData();

    const handleResize = () =>
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [token, refreshKey]); // Only re-fetch when token or refreshKey changes

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <CsvUpload
        onUploadSuccess={() => {
          if (onDataUpdated) onDataUpdated(); // Triggers refreshKey increment in App, refetching everything!
        }}
        token={token}
      />
      <h2 className="text-xl font-semibold mb-4">Market Chart</h2>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
