import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { statusLabel } from "../ticketStatus.js";

function StatusIcon({ status }) {
  if (status === "resolved") {
    return (
      <span className="status-pill resolved" title="Resolved">
        <span className="status-ico">✓</span> Completed
      </span>
    );
  }
  if (status === "inprogress") {
    return (
      <span className="status-pill inprogress" title="In progress">
        <span className="status-ico">◐</span> In progress
      </span>
    );
  }
  return (
    <span className="status-pill open" title="Open">
      <span className="status-ico">○</span> Open
    </span>
  );
}

function shortName(email) {
  if (!email) return "";
  const part = email.split("@")[0];
  return part || email;
}

export default function TicketList() {
  const { currentUser, tickets, deleteTicket } = useApp();
  const navigate = useNavigate();
  const [viewTicket, setViewTicket] = useState(null);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = currentUser.role === "admin";

  function handleDelete(id, title) {
    const ok = window.confirm(
      "Delete ticket \"" + title + "\"? This cannot be undone."
    );
    if (ok) {
      deleteTicket(id);
    }
  }

  const homeLink = isAdmin ? "/admin" : "/home";
  const homeLabel = isAdmin ? "← Admin" : "← Home";

  return (
    <div className="shell">
      <header className="topbar">
        <Link to={homeLink} className="link-back">
          {homeLabel}
        </Link>
        <span className="brand">Tickets</span>
        {isAdmin ? (
          <span className="view-only-badge">View only</span>
        ) : (
          <Link to="/tickets/new" className="btn-small">
            + New
          </Link>
        )}
      </header>

      <main className="main">
        <h1>Ticket list</h1>
        <p className="sub">
          {isAdmin
            ? "You can review all tickets. Editing and deleting are disabled for admins."
            : "Edit or delete from the actions column. Assignees get an email on create, update, or delete."}
        </p>

        {tickets.length === 0 ? (
          <p className="sub">
            {isAdmin
              ? "No tickets yet."
              : "No tickets yet. Create one from “New”."}
          </p>
        ) : (
          <div className="table-wrap">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Assigned</th>
                  <th>Status</th>
                  <th className="th-actions">{isAdmin ? "View" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="ticket-title">{t.title}</div>
                    </td>
                    <td>
                      <div className="assign-name">{shortName(t.assignedEmail)}</div>
                      <div className="assign-email">{t.assignedEmail}</div>
                    </td>
                    <td>
                      <StatusIcon status={t.status} />
                    </td>
                    <td className="td-actions">
                      {isAdmin ? (
                        <button
                          type="button"
                          className="icon-btn"
                          title="View ticket"
                          onClick={() => setViewTicket(t)}
                        >
                          👁️
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="icon-btn"
                            title="Edit"
                            onClick={() => navigate("/tickets/" + t.id + "/edit")}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            title="Delete"
                            onClick={() => handleDelete(t.id, t.title)}
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {viewTicket !== null && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-ticket-title"
        >
          <div className="modal-card">
            <h2 id="view-ticket-title">Ticket details</h2>
            <div className="modal-field">
              <strong>Title</strong>
              <p>{viewTicket.title}</p>
            </div>
            <div className="modal-field">
              <strong>Description</strong>
              <p className="modal-desc">{viewTicket.description}</p>
            </div>
            <div className="modal-field">
              <strong>Assigned (email)</strong>
              <p>{viewTicket.assignedEmail}</p>
            </div>
            <div className="modal-field">
              <strong>Status</strong>
              <p>{statusLabel(viewTicket.status)}</p>
            </div>
            <div className="modal-field">
              <strong>Created by</strong>
              <p>{viewTicket.createdBy || "—"}</p>
            </div>
            <button
              type="button"
              className="btn btn-inline"
              onClick={() => setViewTicket(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}