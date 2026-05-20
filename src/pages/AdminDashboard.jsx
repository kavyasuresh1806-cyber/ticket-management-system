import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function AdminDashboard() {
  const { currentUser, logout, addUser, updateUser, users } = useApp();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const [editOriginalEmail, setEditOriginalEmail] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editMsg, setEditMsg] = useState("");

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  function handleCreateUser(event) {
    event.preventDefault();
    setMsg("");

    if (email.trim() === "") {
      setMsg("Enter user email");
      return;
    }
    if (phone.trim() === "") {
      setMsg("Enter phone number");
      return;
    }
    if (password === "") {
      setMsg("Enter password");
      return;
    }

    const result = addUser(email, phone, password);
    if (!result.ok) {
      setMsg(result.message);
      return;
    }

    setMsg("User created. A welcome email (with password) was triggered for that address.");
    setEmail("");
    setPhone("");
    setPassword("");
  }

  function openEdit(u) {
    setEditOriginalEmail(u.email);
    setEditEmail(u.email);
    setEditPhone(u.phone);
    setEditPassword("");
    setEditMsg("");
  }

  function closeEdit() {
    setEditOriginalEmail("");
    setEditEmail("");
    setEditPhone("");
    setEditPassword("");
    setEditMsg("");
  }

  function handleUpdateUser(event) {
    event.preventDefault();
    setEditMsg("");

    if (editEmail.trim() === "") {
      setEditMsg("Enter email");
      return;
    }
    if (editPhone.trim() === "") {
      setEditMsg("Enter phone number");
      return;
    }

    const result = updateUser(editOriginalEmail, {
      email: editEmail,
      phone: editPhone,
      password: editPassword,
    });
    if (!result.ok) {
      setEditMsg(result.message);
      return;
    }

    closeEdit();
  }

  const normalUsers = users.filter((u) => u.role !== "admin");
  const isEditing = editOriginalEmail !== "";

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-left">
          <span className="brand">Admin</span>
          <Link to="/tickets" className="link-inline">
            View tickets
          </Link>
        </div>
        <button type="button" className="btn-outline" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="main">
        <h1>Create user</h1>
        <p className="sub">
          Add users with email, phone number, and password. After each create,
          an email is sent to that user with their password (see toast and
          browser console; use a webhook for real mail).
        </p>

        <div className="card">
          <form onSubmit={handleCreateUser}>
            <div className="field">
              <label htmlFor="newEmail">Email</label>
              <input
                id="newEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="newPhone">Phone number</label>
              <input
                id="newPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="newPassword">Password</label>
              <input
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-inline">
              Create user
            </button>
          </form>
          {msg !== "" && (
            <p className={"form-msg " + (msg.includes("created") ? "ok" : "error")}>
              {msg}
            </p>
          )}
        </div>

        <h2 style={{ marginTop: 28 }}>User list</h2>
        <p className="sub">
          Edit a user to change email, phone, or password. Leave password empty
          to keep the current one. The user receives an email after each update.
        </p>

        {normalUsers.length === 0 ? (
          <p className="sub">No users yet. Create one above.</p>
        ) : (
          <div className="table-wrap">
            <table className="ticket-table user-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Phone</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {normalUsers.map((u) => (
                  <tr key={u.email}>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td className="td-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        title="Edit user"
                        onClick={() => openEdit(u)}
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {isEditing && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-user-title"
        >
          <div className="modal-card">
            <h2 id="edit-user-title">Edit user</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="field">
                <label htmlFor="editEmail">Email</label>
                <input
                  id="editEmail"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="editPhone">Phone number</label>
                <input
                  id="editPhone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="editPassword">New password</label>
                <input
                  id="editPassword"
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              {editMsg !== "" && (
                <p className="form-msg error">{editMsg}</p>
              )}
              <div className="row-btns">
                <button type="submit" className="btn btn-inline">
                  Save
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}