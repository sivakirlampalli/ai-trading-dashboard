📊AI-Powered Trading Dashboard with Real-Time Market Visualization & Signal Generation

🚀 Features

📈 Real-Time Charts – Visualize live stock/crypto price movements.

🤖 AI-Powered Signals – Leverages ML models to generate buy/sell insights.

🛠️ Customizable Dashboard – Add/remove widgets, filter assets, and personalize views.

🔒 Secure API Integration – Market data fetched via environment variables (.env).

📊 Historical Analytics – Explore past trends with zoom/pan-enabled charts.

🎨 Modern UI – Built with TailwindCSS for a clean, responsive design.

Welcome to the AI-Powered Trading Dashboard! This project contains a React frontend and a Python FastAPI backend integrated with SQLite for database management.

Project Structure
client/ - React frontend application

server/ - Python backend application (FastAPI)

app/database.py - SQLAlchemy configuration for SQLite database at app/app.db

server/requirements.txt - Python package dependencies

Prerequisites
Node.js (version 18 or higher recommended)

Python 3.9 or higher

Git

Setup Instructions
1. Clone the repository
bash
git clone https://github.com/sivakirlampalli/ai-trading-dashboard.git
cd ai-trading-dashboard
2. Set up and run the Python backend
bash
cd server
python -m venv venv
source venv/bin/activate     # For Windows use: venv\Scripts\activate

pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload
The backend server will run at: http://localhost:8000/

3. Set up and run the React frontend
Open a new terminal window/tab:

bash
cd client
npm install
npm start
The frontend will be accessible at: http://localhost:3000/

Usage
Open both backend and frontend running on their respective ports.

Visit http://localhost:3000 in your browser.

Register a new user or log in.

Interact with the dashboard to upload CSV data or view live market signals.

Database Information
The backend uses SQLite for its database.

Database file path: server/app/app.db

SQLite database URL is configured directly in server/app/database.py:

python
DATABASE_URL = "sqlite:///./app.db"
No additional configuration is needed for the database.

Notes
Make sure the backend server is running before starting the frontend.

You don't need to setup or configure any environment variables for local development.

If you want to deploy the app later, ensure to configure environment variables and database path appropriately.

Contact
For any questions, contact sivakirlampalli04@gmail.com
