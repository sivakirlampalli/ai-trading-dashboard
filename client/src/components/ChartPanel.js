import React, { useEffect, useRef } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import CsvUpload from "./CsvUpload";

export default function ChartPanel({ onDataUpdated }) {
  const chartContainerRef = useRef();
  const candleSeriesRef = useRef();

  const fetchChartData = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/chart-data");
    const data = await res.json();
    if (candleSeriesRef.current && data.length > 0) {
      candleSeriesRef.current.setData(data);
    }
    if (onDataUpdated) onDataUpdated();
  };

  useEffect(() => {
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

    fetchChartData();

    const handleResize = () =>
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <CsvUpload onUploadSuccess={fetchChartData} />
      <h2 className="text-xl font-semibold mb-4">Market Chart</h2>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
