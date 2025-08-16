import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

function formatStockData(apiData) {
  const intraday = apiData["Time Series (5min)"];
  const daily = apiData["Time Series (Daily)"];
  let timeSeries = intraday || daily;
  if (!timeSeries) return [];
  return Object.entries(timeSeries)
    .map(([timestamp, values]) => ({
      time: Math.floor(new Date(timestamp).getTime() / 1000),
      open: parseFloat(values["1. open"]),
      high: parseFloat(values["2. high"]),
      low: parseFloat(values["3. low"]),
      close: parseFloat(values["4. close"]),
      volume: parseFloat(values["5. volume"]),
    }))
    .sort((a, b) => a.time - b.time);
}

function formatCryptoOhlc(ohlcData) {
  return ohlcData.map(([time, open, high, low, close]) => ({
    time: Math.floor(time / 1000),
    open: Number(open),
    high: Number(high),
    low: Number(low),
    close: Number(close),
    volume: 0,
  }));
}

export default function LiveChartPanel({ dataSource, symbol, token }) {
  const chartContainerRef = useRef();
  const candleSeriesRef = useRef();
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    if (!token || !symbol || (dataSource !== "stocks" && dataSource !== "crypto")) return;
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 320,
      layout: { backgroundColor: "#1e293b", textColor: "#d1d5db" },
      grid: { vertLines: { color: "#334155" }, horzLines: { color: "#334155" } },
      crosshair: { mode: 1 },
      priceScale: { borderColor: "#475569" },
      timeScale: { borderColor: "#475569", timeVisible: true, secondsVisible: false },
    });
    candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e", downColor: "#ef4444",
      borderDownColor: "#ef4444", borderUpColor: "#22c55e",
      wickDownColor: "#ef4444", wickUpColor: "#22c55e",
    });
    const fetchData = async () => {
      let candles = [];
      if (dataSource === "stocks") {
        const url = `${API_URL}/api/fetch-stock?symbol=${symbol}`;
        const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const apiData = await res.json();
        candles = formatStockData(apiData);
        const signalsUrl = `${API_URL}/api/stock-signals-sma?symbol=${symbol}`;
        const signalsRes = await fetch(signalsUrl);
        const signalsData = await signalsRes.json();
        setSignals(signalsData);
        if (typeof candleSeriesRef.current.setMarkers === "function") {
          candleSeriesRef.current.setMarkers(
            signalsData.map(sig => ({
              time: Math.floor(new Date(sig.timestamp).getTime() / 1000),
              position: sig.type === "buy" ? "belowBar" : "aboveBar",
              color: sig.type === "buy" ? "#22c55e" : "#ef4444",
              shape: sig.type === "buy" ? "arrowUp" : "arrowDown",
              text: sig.type.toUpperCase(),
            }))
          );
        }
      } else if (dataSource === "crypto") {
        const url = `${API_URL}/api/fetch-crypto-ohlc?symbol=${symbol.toLowerCase()}&days=7`;
        const res = await fetch(url);
        const ohlcData = await res.json();
        if (!Array.isArray(ohlcData)) {
          alert("Backend returned non-array OHLC, cannot plot chart.");
          setSignals([]);
          return;
        }
        candles = formatCryptoOhlc(ohlcData);
        const signalsUrl = `${API_URL}/api/live-signals-sma?symbol=${symbol.toLowerCase()}`;
        const signalsRes = await fetch(signalsUrl);
        const signalsData = await signalsRes.json();
        setSignals(signalsData);
        if (typeof candleSeriesRef.current.setMarkers === "function") {
          candleSeriesRef.current.setMarkers(
            signalsData.map(sig => ({
              time: sig.timestamp,
              position: sig.type === "buy" ? "belowBar" : "aboveBar",
              color: sig.type === "buy" ? "#22c55e" : "#ef4444",
              shape: sig.type === "buy" ? "arrowUp" : "arrowDown",
              text: sig.type.toUpperCase(),
            }))
          );
        }
      }
      console.log("candles for chart:", candles);
      if (!candles || candles.length === 0) {
        alert("ERROR: No candle data available for " + symbol);
        setSignals([]);
        return;
      }
      candleSeriesRef.current.setData(candles);
    };
    fetchData();
    const handleResize = () =>
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [dataSource, symbol, token]);

  // NEW: Alert logic for "only if new since last seen"
  const latestSignal = signals.length > 0 ? signals[signals.length - 1] : null;
  const localKey = symbol ? `lastSignal_${symbol}` : null;
  const lastSeenTimestamp = localKey ? localStorage.getItem(localKey) : null;
  const hasNewSignal =
    latestSignal &&
    (!lastSeenTimestamp || String(latestSignal.timestamp) !== String(lastSeenTimestamp));
  if (hasNewSignal && localKey) {
    localStorage.setItem(localKey, latestSignal.timestamp);
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-4">
        {symbol ? `${symbol.toUpperCase()} Live Market Chart` : "Live Market Chart"}
      </h2>
      <div ref={chartContainerRef} style={{ width: "100%", height: "320px" }} className="w-full" />
      {/* Trade Signals list */}
      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">Trade Signals</h3>
        {signals.length === 0 ? (
          <p>No signals.</p>
        ) : (
          <ul>
            {signals.map((sig, idx) => (
              <li key={idx}>
                {sig.type.toUpperCase()} (<b>{sig.confidence}%</b>) at {typeof sig.timestamp === "string"
                  ? new Date(sig.timestamp).toLocaleString()
                  : new Date(sig.timestamp * 1000).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Alerts panel: Show only if signal is new since last visit */}
      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">Alerts</h3>
        {hasNewSignal && latestSignal ? (
          <p>
            {latestSignal.type.toUpperCase()} ({latestSignal.confidence}%) at {typeof latestSignal.timestamp === "string"
              ? new Date(latestSignal.timestamp).toLocaleString()
              : new Date(latestSignal.timestamp * 1000).toLocaleString()}
          </p>
        ) : (
          <p>No alerts available.</p>
        )}
      </div>
    </div>
  );
}
