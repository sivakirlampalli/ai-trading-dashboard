import React, { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export default function Register({ onRegisterSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Send as x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      if (!res.ok) throw new Error("Registration failed");
      setSuccess(true);
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-24 p-4 bg-gray-800 rounded">
      <h2 className="text-xl mb-4">Register</h2>
      <input
        className="w-full p-2 mb-4"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full p-2 mb-4"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && (
        <p className="text-green-500 mb-4">
          Registration successful! You can now <a href="/login" className="underline">Login</a>.
        </p>
      )}
      <button type="submit" className="w-full bg-green-600 py-2 rounded text-white hover:bg-green-700">
        Register
      </button>
    </form>
  );
}
