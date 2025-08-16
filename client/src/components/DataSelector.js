import React, { useState } from "react";

const stockSymbols = ["AAPL", "MSFT", "GOOG"];
const cryptoSymbols = ["bitcoin", "ethereum", "litecoin"];

export default function DataSelector({ onSourceChange, onSymbolChange }) {
  const [dataSource, setDataSource] = useState("csv");
  const [symbol, setSymbol] = useState("");

  // Update available symbols based on data source
  let symbols = [];
  if (dataSource === "stocks") symbols = stockSymbols;
  else if (dataSource === "crypto") symbols = cryptoSymbols;
  else symbols = [];

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-4">Select Data Source & Symbol</h2>

      <div className="mb-4">
        <label className="mr-4 font-semibold">Data Source:</label>
        <select
          value={dataSource}
          onChange={(e) => {
            setDataSource(e.target.value);
            onSourceChange(e.target.value);
            setSymbol(""); // reset symbol when source changes
            onSymbolChange("");
          }}
          className="p-2 rounded bg-gray-700 text-white"
        >
          <option value="csv">CSV Upload (Manual)</option>
          <option value="stocks">Alpha Vantage (Stocks)</option>
          <option value="crypto">CoinGecko (Crypto)</option>
        </select>
      </div>

      {(dataSource === "stocks" || dataSource === "crypto") && (
        <div>
          <label className="mr-4 font-semibold">Symbol:</label>
          <select
            value={symbol}
            onChange={(e) => {
              setSymbol(e.target.value);
              onSymbolChange(e.target.value);
            }}
            className="p-2 rounded bg-gray-700 text-white"
          >
            <option value="">-- Select Symbol --</option>
            {symbols.map((sym) => (
              <option key={sym} value={sym}>
                {sym.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
