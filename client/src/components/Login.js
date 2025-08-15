import React, { useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { Link, useNavigate } from "react-router-dom"; // <-- add useNavigate

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // <-- add this

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const res = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        setError("Invalid username or password");
        return;
      }

      const data = await res.json();
      login(data.access_token, username);
      console.log('JWT Token:', data.access_token);

      // **Add this line to navigate to dashboard after login**
      navigate("/", { replace: true });
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-24 p-4 bg-gray-800 rounded">
      <h2 className="text-xl mb-4">Login</h2>
      <input
        className="w-full p-2 mb-4"
        type="text"
        placeholder="Email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="w-full p-2 mb-4"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button type="submit" className="w-full bg-blue-600 py-2 rounded text-white hover:bg-blue-700">
        Login
      </button>
      <p className="mt-4 text-gray-400 text-center">
        Don’t have an account? <Link to="/register" className="text-blue-400 underline">Register here</Link>
      </p>
    </form>
  );
}
