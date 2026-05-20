import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { STATUS_OPTIONS } from "../ticketStatus.js";

export default function EditTicket() {
  const { id } = useParams();
  const { currentUser, tickets, updateTicket } = useApp();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedEmail, setAssignedEmail] = useState("");
  const [status, setStatus] = useState("open");
  const [msg, setMsg] = useState("");

  const ticket = tickets.find((t) => t.id === id);

  useEffect(() => {
    const t = tickets.find((x) => x.id === id);
    if (!t) return;
    setTitle(t.title);
    setDescription(t.description);
    setAssignedEmail(t.assignedEmail);
    setStatus(t.status);
  }, [id]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (!ticket) {
    return <Navigate to="/tickets" replace />;
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

    updateTicket(id, { title, description, assignedEmail, status });
    navigate("/tickets", { replace: true });
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/tickets" className="link-back">
          ← Tickets
        </Link>
        <span className="brand">Edit ticket</span>
        <span />
      </header>

      <main className="main narrow">
        <h1>Edit ticket</h1>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="eTitle">Ticket title</label>
              <input
                id="eTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="eDesc">Ticket description</label>
              <textarea
                id="eDesc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="eAssign">Assigned person (email)</label>
              <input
                id="eAssign"
                type="email"
                value={assignedEmail}
                onChange={(e) => setAssignedEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="eStatus">Status</label>
              <select
                id="eStatus"
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
                Save changes
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