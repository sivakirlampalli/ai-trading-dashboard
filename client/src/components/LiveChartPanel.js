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

export default function LiveChartPanel({ dataSource, symbol, token, csvData }) {
  const chartContainerRef = useRef();
  const candleSeriesRef = useRef();
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    // Fixes the ESLint warning: capture the container node
    const container = chartContainerRef.current;

    if (!container) return;
    if (!symbol ||
      (dataSource !== "stocks" &&
        dataSource !== "crypto" &&
        dataSource !== "csv-upload")
    ) return;

    // Ensure only one chart at a time
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 320,
      layout: { backgroundColor: "#1e293b", textColor: "#d1d5db" },
      grid: {
        vertLines: { color: "#334155" },
        horzLines: { color: "#334155" }
      },
      crosshair: { mode: 1 },
      priceScale: { borderColor: "#475569" },
      timeScale: {
        borderColor: "#475569",
        timeVisible: true,
        secondsVisible: false
      }
    });

    candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e"
    });

    const fetchData = async () => {
      let candles = [];
      if (dataSource === "csv-upload" && csvData) {
        candles = csvData
          .map(row => ({
            time: Math.floor(new Date(row.timestamp).getTime() / 1000),
            open: parseFloat(row.open),
            high: parseFloat(row.high),
            low: parseFloat(row.low),
            close: parseFloat(row.close),
            volume: parseFloat(row.volume)
          }))
          .sort((a, b) => a.time - b.time);

        setSignals([]);

        if (typeof candleSeriesRef.current.setMarkers === "function") {
          candleSeriesRef.current.setMarkers([]);
        }
        if (!candles || candles.length === 0) {
          alert("ERROR: No candle data available for " + symbol);
          setSignals([]);
          return;
        }
        candleSeriesRef.current.setData(candles);
        return;
      }
      if (dataSource === "stocks") {
        const url = `${API_URL}/api/fetch-stock?symbol=${symbol.toUpperCase()}`;
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const apiData = await res.json();
        candles = formatStockData(apiData);
      }
      else if (dataSource === "crypto") {
        const url = `${API_URL}/api/fetch-crypto-ohlc?symbol=${symbol.toLowerCase()}&days=1`;
        const res = await fetch(url);
        const ohlcData = await res.json();
        if (!Array.isArray(ohlcData)) {
          alert("Backend returned non-array OHLC, cannot plot chart.");
          setSignals([]);
          return;
        }
        candles = formatCryptoOhlc(ohlcData);
      }
      if (!candles || candles.length === 0) {
        alert("ERROR: No candle data available for " + symbol);
        setSignals([]);
        return;
      }
      candleSeriesRef.current.setData(candles);
    };

    fetchData();

    const resizeHandler = () =>
      chart.applyOptions({ width: container.clientWidth });
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      chart.remove();
    };
  }, [dataSource, symbol, token, csvData]);

  useEffect(() => {
    if (!symbol || !(dataSource === "stocks" || dataSource === "crypto")) return;
    const pollSignals = () => {
      fetch(`${API_URL}/api/latest-signals?symbol=${symbol.toUpperCase()}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSignals(data);
            if (
              candleSeriesRef.current &&
              typeof candleSeriesRef.current.setMarkers === "function"
            ) {
              candleSeriesRef.current.setMarkers(
                data.map(sig => ({
                  time:
                    typeof sig.timestamp === "number"
                      ? Math.floor(sig.timestamp)
                      : Math.floor(new Date(sig.timestamp).getTime() / 1000),
                  position: sig.type === "buy" ? "belowBar" : "aboveBar",
                  color: sig.type === "buy" ? "#22c55e" : "#ef4444",
                  shape: sig.type === "buy" ? "arrowUp" : "arrowDown",
                  text: sig.type.toUpperCase()
                }))
              );
            }
          } else {
            setSignals([]);
          }
        })
        .catch(() => setSignals([]));
    };
    pollSignals();
    const interval = setInterval(pollSignals, 90000); // 90 sec, to respect rate limits
    return () => clearInterval(interval);
  }, [symbol, dataSource]);

  const latestSignal = Array.isArray(signals) && signals.length > 0 ? signals[signals.length - 1] : null;

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-4">
        {symbol ? `${symbol.toUpperCase()} Live Market Chart` : "Live Market Chart"}
      </h2>
      <div
        ref={chartContainerRef}
        style={{ width: "100%", height: "320px" }}
        className="w-full"
      />
      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">Trade Signals</h3>
        {Array.isArray(signals) && signals.length === 0 ? (
          <p>No signals.</p>
        ) : (
          <ul>
            {Array.isArray(signals) ? signals.map((sig, idx) => (
              <li key={idx}>
                {sig.type.toUpperCase()} (<b>{sig.confidence}%</b>) at{" "}
                {typeof sig.timestamp === "number"
                  ? new Date(sig.timestamp * 1000).toLocaleString()
                  : new Date(sig.timestamp).toLocaleString()}
              </li>
            )) : <li>Invalid signal data from backend</li>}
          </ul>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">Alerts</h3>
        {latestSignal ? (
          <p>
            {latestSignal.type.toUpperCase()} ({latestSignal.confidence}%) at{" "}
            {typeof latestSignal.timestamp === "number"
              ? new Date(latestSignal.timestamp * 1000).toLocaleString()
              : new Date(latestSignal.timestamp).toLocaleString()}
          </p>
        ) : (
          <p>No alerts available.</p>
        )}
      </div>
    </div>
  );
}
