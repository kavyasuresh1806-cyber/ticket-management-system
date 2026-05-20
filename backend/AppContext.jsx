import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { sendMailToAssignee } from "../services/assigneeMail.js";
import {
  sendNewUserWelcomeEmail,
  sendUserAccountUpdatedEmail,
} from "../services/userAccountMail.js";

// ─── Socket.io connection ─────────────────────────────────────────────────────
const socket = io("http://localhost:3001");

// ─── API helper ──────────────────────────────────────────────────────────────
const BASE = "/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("current_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [mailToast, setMailToast] = useState(null);
  const ticketsRef = useRef(tickets);
  ticketsRef.current = tickets;

  // ── Auto-dismiss mail toast ───────────────────────────────────────────────
  useEffect(() => {
    if (!mailToast) return;
    const timer = window.setTimeout(() => setMailToast(null), 9000);
    return () => window.clearTimeout(timer);
  }, [mailToast]);

  // ── Load data on login ───────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    fetchTickets();
    if (currentUser.role === "admin") fetchUsers();
  }, [currentUser]);

  // ── Real-time socket events ───────────────────────────────────────────────
  useEffect(() => {
    socket.on("ticket:new", (ticket) => {
      setTickets((prev) =>
        prev.some((t) => t.id === ticket.id) ? prev : [ticket, ...prev]
      );
    });
    socket.on("ticket:updated", (ticket) => {
      setTickets((prev) => prev.map((t) => (t.id === ticket.id ? ticket : t)));
    });
    socket.on("ticket:deleted", ({ id }) => {
      setTickets((prev) => prev.filter((t) => t.id !== id));
    });
    return () => {
      socket.off("ticket:new");
      socket.off("ticket:updated");
      socket.off("ticket:deleted");
    };
  }, []);

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  async function fetchTickets() {
    try {
      const data = await apiFetch("/tickets");
      setTickets(data);
    } catch (e) {
      console.error("fetchTickets:", e.message);
    }
  }

  async function fetchUsers() {
    try {
      const data = await apiFetch("/users");
      setUsers(data);
    } catch (e) {
      console.error("fetchUsers:", e.message);
    }
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  async function login(email, password) {
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("current_user", JSON.stringify(data.user));
      setCurrentUser(data.user);
      return { ok: true, role: data.user.role };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("current_user");
    setCurrentUser(null);
    setTickets([]);
    setUsers([]);
  }

  // ── Users (admin only) ────────────────────────────────────────────────────
  async function addUser(email, phone, password) {
    try {
      const data = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({ email, phone, password }),
      });
      setUsers((prev) => [...prev, data.user]);
      void sendNewUserWelcomeEmail({
        to: email,
        password,
        adminEmail: currentUser.email,
      }).then((result) => setMailToast(result));
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  }

  async function updateUser(originalEmail, { email, phone, password }) {
    try {
      const data = await apiFetch(
        `/users/${encodeURIComponent(originalEmail)}`,
        {
          method: "PUT",
          body: JSON.stringify({ email, phone, password }),
        }
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.email.toLowerCase() === originalEmail.toLowerCase()
            ? { ...u, email: data.user.email, phone: data.user.phone }
            : u
        )
      );
      void sendUserAccountUpdatedEmail({
        to: data.user.email,
        phone: data.user.phone,
        passwordChanged: data.passwordChanged,
        newPassword: data.newPassword,
        adminEmail: currentUser.email,
      }).then((result) => setMailToast(result));
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  }

  // ── Tickets ───────────────────────────────────────────────────────────────
  async function addTicket({ title, description, assignedEmail, status }) {
    try {
      const ticket = await apiFetch("/tickets", {
        method: "POST",
        body: JSON.stringify({ title, description, assignedEmail, status }),
      });
      // Socket will handle state update via "ticket:new" event
      void sendMailToAssignee({
        action: "create",
        ticket,
        actorEmail: currentUser.email,
      }).then((result) => setMailToast(result));
    } catch (e) {
      console.error("addTicket:", e.message);
    }
  }

  async function updateTicket(id, { title, description, assignedEmail, status }) {
    try {
      const updated = await apiFetch(`/tickets/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title, description, assignedEmail, status }),
      });
      // Socket will handle state update via "ticket:updated" event
      void sendMailToAssignee({
        action: "update",
        ticket: updated,
        actorEmail: currentUser.email,
      }).then((result) => setMailToast(result));
    } catch (e) {
      console.error("updateTicket:", e.message);
    }
  }

  async function deleteTicket(id) {
    const target = ticketsRef.current.find((t) => t.id === id);
    try {
      await apiFetch(`/tickets/${id}`, { method: "DELETE" });
      // Socket will handle state update via "ticket:deleted" event
      if (target) {
        void sendMailToAssignee({
          action: "delete",
          ticket: target,
          actorEmail: currentUser.email,
        }).then((result) => setMailToast(result));
      }
    } catch (e) {
      console.error("deleteTicket:", e.message);
    }
  }

  function dismissMailToast() {
    setMailToast(null);
  }

  const value = {
    users,
    tickets,
    currentUser,
    mailToast,
    dismissMailToast,
    login,
    logout,
    addUser,
    updateUser,
    addTicket,
    updateTicket,
    deleteTicket,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
