import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { STATUS_OPTIONS } from "../ticketStatus.js";

export default function CreateTicket() {
  const { currentUser, addTicket } = useApp();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedEmail, setAssignedEmail] = useState("");
  const [status, setStatus] = useState("open");
  const [msg, setMsg] = useState("");

  // auth check
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // admin block
  if (currentUser.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMsg("");

    if (title.trim() === "") {
      setMsg("Enter ticket title");
      return;
    }
    if (description.trim() === "") {
      setMsg("Enter description");
      return;
    }
    if (assignedEmail.trim() === "") {
      setMsg("Enter assignee email");
      return;
    }

    // create ticket
    addTicket({
      title,
      description,
      assignedEmail,
      status,
    });

    // reset form (optional but good UX)
    setTitle("");
    setDescription("");
    setAssignedEmail("");
    setStatus("open");

    // ✅ FIXED: go to ticket list page
    navigate("/tickets", { replace: true });
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/home" className="link-back">
          ← Home
        </Link>
        <span className="brand">New ticket</span>
        <span />
      </header>

      <main className="main narrow">
        <h1>Create ticket</h1>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Ticket title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Assigned email</label>
              <input
                type="email"
                value={assignedEmail}
                onChange={(e) => setAssignedEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="row-btns">
              <button type="submit" className="btn btn-inline">
                Save ticket
              </button>

              <Link to="/tickets" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </form>

          {msg !== "" && <p className="form-msg error">{msg}</p>}
        </div>
      </main>
    </div>
  );
}