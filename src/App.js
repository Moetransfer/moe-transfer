import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState("");

  const [message, setMessage] = useState("");
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

const API_URL = "https://moe-transfer-backend.onrender.com";

  const getToken = () => {
    return localStorage.getItem("moeToken");
  };

  const loadDashboard = useCallback(async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const res = await axios.get(`${API_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBalance(res.data.balance);
      setTransactions(res.data.transactions);
    } catch (err) {
      console.log(err);
      setMessage("Please login again");
      localStorage.removeItem("moeToken");
    }
  }, []);

  const register = async () => {
    try {
      const res = await axios.post(`${API_URL}/register`, {
        email,
        password,
      });

      setMessage(res.data.message);
      setMode("login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      localStorage.setItem("moeToken", res.data.token);

      setMessage(res.data.message);
      setMode("transfer");

      await loadDashboard();
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  const transfer = async () => {
    try {
      const token = getToken();

      const res = await axios.post(
        `${API_URL}/transfer`,
        {
          receiverId,
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message);
      setReceiverId("");
      setAmount("");

      await loadDashboard();
    } catch (err) {
      setMessage(err.response?.data?.message || "Transfer failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("moeToken");
    setBalance(0);
    setTransactions([]);
    setMessage("Logged out");
    setMode("login");
  };

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="app">
      <div className="overlay">
        <h1 className="title">💸 Moe Transfer</h1>

        <div className="tabs">
          <button onClick={() => setMode("login")}>Login</button>
          <button onClick={() => setMode("register")}>Register</button>
          <button onClick={() => setMode("transfer")}>Transfer</button>
          <button onClick={logout}>Logout</button>
        </div>

        <div className="card">
          {mode === "login" && (
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button onClick={login}>Login</button>
            </div>
          )}

          {mode === "register" && (
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button onClick={register}>Register</button>
            </div>
          )}

          {mode === "transfer" && (
            <div>
              <input
                type="number"
                placeholder="Receiver ID"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
              />

              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <button onClick={transfer}>Send Money</button>
            </div>
          )}
        </div>

        <h2>{message}</h2>

        <div className="dashboard">
          <h2>Available Balance</h2>

          <h1>€{Number(balance).toFixed(2)}</h1>

          <h2>Transactions</h2>

          {transactions.map((tx, index) => (
            <div key={index} className="transaction">
              <p>
                <strong>Receiver ID:</strong> {tx.receiver_id}
              </p>

              <p>
                <strong>Amount:</strong> €{Number(tx.amount).toFixed(2)}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(tx.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
