import React, { useState } from "react";
import Papa from "papaparse";
import LiveChartPanel from "./LiveChartPanel"; // adjust path as needed

export default function CsvUpload({ token }) {
  const [csvData, setCsvData] = useState({});
  const [symbols, setSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [showPanel, setShowPanel] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: results => {
        const grouped = {};
        results.data.forEach(row => {
          if (!row.symbol) return;
          if (!grouped[row.symbol]) grouped[row.symbol] = [];
          grouped[row.symbol].push(row);
        });
        setCsvData(grouped);
        const allSymbols = Object.keys(grouped);
        setSymbols(allSymbols);
        if (allSymbols.length > 0) setSelectedSymbol(allSymbols[0]);
        setShowPanel(true);
      }
    });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-2">Upload CSV Market Data</h2>
      {/* Only file input here, no extra input */}
      <input type="file" accept=".csv" onChange={handleFileChange} />
      
      {/* Symbol Dropdown */}
      {symbols.length > 0 && (
        <select 
          className="ml-4 mt-2 p-1 rounded text-black"
          value={selectedSymbol} 
          onChange={e => setSelectedSymbol(e.target.value)}
        >
          {symbols.map(sym => (
            <option key={sym} value={sym}>{sym}</option>
          ))}
        </select>
      )}

      {/* LiveChartPanel for selected symbol */}
      {showPanel && selectedSymbol && csvData[selectedSymbol] && (
        <LiveChartPanel
          dataSource="csv-upload"
          symbol={selectedSymbol}
          token={token}
          csvData={csvData[selectedSymbol]}
        />
      )}
    </div>
  );
}
