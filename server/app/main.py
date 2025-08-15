from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import csv
from io import StringIO

app = FastAPI()

# Allow CORS for frontend (React dev server at localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Market Data & Signals =====
market_data = []
trade_signals = []

# Helper: Generate SMA crossover signals with dynamic confidence
def generate_signals(data):
    signals = []
    short_window = 5
    long_window = 10
    closes = [row["close"] for row in data]

    for i in range(len(data)):
        if i < long_window:
            continue

        short_avg = sum(closes[i - short_window:i]) / short_window
        long_avg = sum(closes[i - long_window:i]) / long_window

        # Confidence based on relative SMA difference
        diff_ratio = abs(short_avg - long_avg) / long_avg
        confidence_percent = round(min(diff_ratio * 100, 99), 1)

        if short_avg > long_avg:
            signal_type = "Buy"
        elif short_avg < long_avg:
            signal_type = "Sell"
        else:
            continue

        signals.append({
            "id": len(signals) + 1,
            "symbol": data[i]["symbol"],
            "type": signal_type,
            "confidence": f"{confidence_percent}%",
            "time": data[i]["time"]
        })

    return signals

# ===== API Endpoints =====

@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload a CSV file with headers:
    symbol,timestamp,open,high,low,close,volume
    """
    global market_data, trade_signals

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(StringIO(decoded))

    rows = []
    for row in reader:
        rows.append({
            "symbol": row["symbol"],
            "time": row["timestamp"],
            "open": float(row["open"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "close": float(row["close"]),
            "volume": float(row["volume"]),
        })

    market_data = rows
    trade_signals = generate_signals(rows)

    print(f"✅ Received {len(rows)} rows from CSV, generated {len(trade_signals)} signals")
    return {"message": f"CSV processed with {len(rows)} rows and {len(trade_signals)} signals"}

@app.get("/api/chart-data")
async def get_chart_data():
    return market_data

@app.get("/api/signals")
async def get_signals():
    return trade_signals

@app.get("/api/alerts")
async def get_alerts():
    return [f"{sig['symbol']} signal: {sig['type']} at {sig['time']}" for sig in trade_signals[-5:]]
