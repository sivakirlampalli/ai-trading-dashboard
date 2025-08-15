from fastapi import FastAPI, Depends, File, UploadFile, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
import csv
from io import StringIO
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User
from passlib.context import CryptContext
from app.auth import create_access_token, verify_access_token

app = FastAPI()

# Initialize DB tables
Base.metadata.create_all(bind=engine)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to get user by email
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# Function to create user
def create_user(db: Session, email: str, password: str):
    hashed_pw = pwd_context.hash(password)
    db_user = User(email=email, hashed_password=hashed_pw)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# JWT Authentication setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# User registration endpoint
@app.post("/register")
def register(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    if get_user_by_email(db, email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(db, email, password)
    return {"message": "User registered successfully", "user": user.email}

# User login endpoint - returns JWT access token
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(db, form_data.username)
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# Dependency to get current authenticated user
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    email = verify_access_token(token)
    if email is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Test DB connection endpoint (shows list of users)
@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {"users": [user.email for user in users]}

# Allow CORS for frontend React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://172.17.240.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== Market Data & Signals (in-memory storage for now) =====
market_data = []
trade_signals = []

# Helper function to generate signals (SMA crossover)
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

# ===== API Endpoints (some routes are public, protect others as needed) =====

@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    """
    Upload CSV file; requires authentication
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

    print(f"✅ User {user.email} uploaded {len(rows)} rows; generated {len(trade_signals)} signals")
    return {"message": f"CSV processed with {len(rows)} rows and {len(trade_signals)} signals"}

# Protected routes requiring authentication; you can wrap others similarly
@app.get("/api/chart-data")
def get_chart_data(user: User = Depends(get_current_user)):
    return market_data

@app.get("/api/signals")
def get_signals(user: User = Depends(get_current_user)):
    return trade_signals

@app.get("/api/alerts")
def get_alerts(user: User = Depends(get_current_user)):
    return [f"{sig['symbol']} signal: {sig['type']} at {sig['time']}" for sig in trade_signals[-5:]]
