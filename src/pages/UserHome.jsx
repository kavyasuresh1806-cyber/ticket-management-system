import { Link, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function UserHome() {
  const { currentUser, logout } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">Hello, {currentUser.email}</span>
        <button type="button" className="btn-outline" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="main">
        <h1>Home</h1>
        <p className="sub">Create a ticket or open your ticket list.</p>
        <div className="nav-cards">
          <Link className="nav-card" to="/tickets/new">
            Create ticket
          </Link>
          <Link className="nav-card" to="/tickets">
            Ticket list
          </Link>
        </div>
      </main>
    </div>
  );
}