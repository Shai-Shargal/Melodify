import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { User } from "./types";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import Dashboard from "./components/Dashboard.tsx";
import PlaylistView from "./components/PlaylistView.tsx";

function App() {
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage for user data on initial load
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route
            path="/login"
            element={
              !user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />
            }
          />
          <Route
            path="/register"
            element={
              !user ? (
                <Register setUser={setUser} />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/playlist/:id"
            element={
              user ? (
                <PlaylistView user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
