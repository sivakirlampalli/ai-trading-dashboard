import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

// Utility for backend stocks
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

// Utility for backend crypto
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

// SMA crossover signal calculation for local CSV candles
function getSmaSignals(candles, shortPeriod = 2, longPeriod = 5) {
  const closes = candles.map(c => c.close);
  const smaShort = [];
  const smaLong = [];
  for (let i = 0; i < candles.length; i++) {
    smaShort[i] = i >= shortPeriod - 1
      ? closes.slice(i - shortPeriod + 1, i + 1).reduce((a, b) => a + b, 0) / shortPeriod
      : null;
    smaLong[i] = i >= longPeriod - 1
      ? closes.slice(i - longPeriod + 1, i + 1).reduce((a, b) => a + b, 0) / longPeriod
      : null;
  }
  const signals = [];
  for (let i = 1; i < candles.length; i++) {
    if (smaShort[i - 1] == null || smaLong[i - 1] == null) continue;
    if (smaShort[i] > smaLong[i] && smaShort[i - 1] <= smaLong[i - 1]) {
      signals.push({ type: "buy", confidence: 90, timestamp: candles[i].time * 1000 });
    }
    if (smaShort[i] < smaLong[i] && smaShort[i - 1] >= smaLong[i - 1]) {
      signals.push({ type: "sell", confidence: 90, timestamp: candles[i].time * 1000 });
    }
  }
  return signals;
}

export default function LiveChartPanel({ dataSource, symbol, token, csvData }) {
  const chartContainerRef = useRef();
  const candleSeriesRef = useRef();
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (!symbol || (dataSource !== "stocks" && dataSource !== "crypto" && dataSource !== "csv-upload")) return;

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

      // CSV upload branch — local signals only!
      if (dataSource === "csv-upload" && csvData) {
        candles = csvData.map(row => ({
          time: Math.floor(new Date(row.timestamp).getTime() / 1000),
          open: parseFloat(row.open),
          high: parseFloat(row.high),
          low: parseFloat(row.low),
          close: parseFloat(row.close),
          volume: parseFloat(row.volume),
        })).sort((a, b) => a.time - b.time);

        const signalsFromSma = getSmaSignals(candles, 3, 8); // you can lower periods as needed for demo
        setSignals(signalsFromSma);

        if (typeof candleSeriesRef.current.setMarkers === "function") {
          candleSeriesRef.current.setMarkers(
            signalsFromSma.map(sig => ({
              time: Math.floor(sig.timestamp / 1000),
              position: sig.type === "buy" ? "belowBar" : "aboveBar",
              color: sig.type === "buy" ? "#22c55e" : "#ef4444",
              shape: sig.type === "buy" ? "arrowUp" : "arrowDown",
              text: sig.type.toUpperCase(),
            }))
          );
        }

        if (!candles || candles.length === 0) {
          alert("ERROR: No candle data available for " + symbol);
          setSignals([]);
          return;
        }
        candleSeriesRef.current.setData(candles);
        return;
      }

      // Stocks/crypto logic (keep as is)
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
      }
      else if (dataSource === "crypto") {
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
  }, [dataSource, symbol, token, csvData]);

  const latestSignal = signals.length > 0 ? signals[signals.length - 1] : null;

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-4">
        {symbol ? `${symbol.toUpperCase()} Live Market Chart` : "Live Market Chart"}
      </h2>
      <div ref={chartContainerRef} style={{ width: "100%", height: "320px" }} className="w-full" />

      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">Trade Signals</h3>
        {signals.length === 0 ? (
          <p>No signals.</p>
        ) : (
          <ul>
            {signals.map((sig, idx) => (
              <li key={idx}>
                {sig.type.toUpperCase()} (<b>{sig.confidence}%</b>) at {new Date(sig.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">Alerts</h3>
        {latestSignal ? (
          <p>
            {latestSignal.type.toUpperCase()} ({latestSignal.confidence}%) at {new Date(latestSignal.timestamp).toLocaleString()}
          </p>
        ) : (
          <p>No alerts available.</p>
        )}
      </div>
    </div>
  );
}
