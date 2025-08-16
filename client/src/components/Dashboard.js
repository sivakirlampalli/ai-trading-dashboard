import React, { useState } from "react";
import Papa from "papaparse";
import LiveChartPanel from "./LiveChartPanel"; // Adjust this import path as needed

export default function Dashboard() {
  const [stockData, setStockData] = useState({});
  const [symbols, setSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [dataSource, setDataSource] = useState("csv-upload"); // Use this to tell LiveChartPanel to use CSV data

  function handleFileUpload(event) {
    const file = event.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: function(results) {
        const grouped = {};
        results.data.forEach(row => {
          if (!row.symbol) return;
          if (!grouped[row.symbol]) grouped[row.symbol] = [];
          grouped[row.symbol].push(row);
        });
        setStockData(grouped);
        const syms = Object.keys(grouped);
        setSymbols(syms);
        if (syms.length > 0) setSelectedSymbol(syms[0]); // FIX here: set first symbol as selected
      },
    });
  }

  return (
    <div>
      <h2>Upload CSV with multiple symbols</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {symbols.length > 0 && (
        <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)}>
          {symbols.map(sym => (
            <option key={sym} value={sym}>{sym}</option>
          ))}
        </select>
      )}

      {selectedSymbol && stockData[selectedSymbol] && (
        <LiveChartPanel
          dataSource={dataSource}
          symbol={selectedSymbol}
          token={""} // pass your token if needed
          csvData={stockData[selectedSymbol]} // filtered data for selected symbol
        />
      )}
    </div>
  );
}
