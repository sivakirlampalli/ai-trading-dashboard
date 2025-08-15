import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (!success) {
      setError("Invalid username or password");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-24 p-4 bg-gray-800 rounded">
      <h2 className="text-xl mb-4">Login</h2>
      <input
        className="w-full p-2 mb-4"
        type="text"
        placeholder="Username"
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
    </form>
  );
}
