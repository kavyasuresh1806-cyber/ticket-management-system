import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { sendMailToAssignee } from "../services/assigneeMail.js";
import {
  sendNewUserWelcomeEmail,
  sendUserAccountUpdatedEmail,
} from "../services/userAccountMail.js";

const STORAGE_USERS = "learn_app_users";
const STORAGE_TICKETS = "learn_app_tickets";

const defaultUsers = [
  {
    email: "admin@example.com",
    phone: "0000000000",
    password: "admin123",
    role: "admin",
  },
];

function loadUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_USERS);
    if (!raw) return defaultUsers;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultUsers;
    return parsed;
  } catch {
    return defaultUsers;
  }
}

function loadTickets() {
  try {
    const raw = localStorage.getItem(STORAGE_TICKETS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [tickets, setTickets] = useState(loadTickets);
  const [currentUser, setCurrentUser] = useState(null);
  const [mailToast, setMailToast] = useState(null);
  const ticketsRef = useRef(tickets);

  ticketsRef.current = tickets;

  useEffect(() => {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    if (!mailToast) return;
    const timer = window.setTimeout(() => setMailToast(null), 9000);
    return () => window.clearTimeout(timer);
  }, [mailToast]);

  function dismissMailToast() {
    setMailToast(null);
  }

  function login(email, password) {
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );
    if (!found) {
      return { ok: false, message: "Invalid email or password" };
    }
    setCurrentUser({
      email: found.email,
      role: found.role,
      phone: found.phone,
    });
    return { ok: true, role: found.role };
  }

  function logout() {
    setCurrentUser(null);
  }

  function addUser(email, phone, password) {
    const e = email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === e)) {
      return { ok: false, message: "This email is already registered" };
    }
    const newUser = {
      email: email.trim(),
      phone: phone.trim(),
      password,
      role: "user",
    };
    setUsers((prev) => [...prev, newUser]);
    void sendNewUserWelcomeEmail({
      to: newUser.email,
      password: newUser.password,
      adminEmail: currentUser.email,
    }).then((result) => setMailToast(result));
    return { ok: true };
  }

  function updateUser(originalEmail, { email, phone, password }) {
    const origKey = originalEmail.trim().toLowerCase();
    const idx = users.findIndex(
      (u) => u.email.toLowerCase() === origKey && u.role !== "admin"
    );
    if (idx === -1) {
      return { ok: false, message: "User not found" };
    }
    const nextEmail = email.trim();
    const nextKey = nextEmail.toLowerCase();
    if (
      users.some(
        (u, i) =>
          i !== idx && u.email.toLowerCase() === nextKey
      )
    ) {
      return { ok: false, message: "This email is already used by another user" };
    }
    const old = users[idx];
    const passwordChanged = password.trim() !== "";
    const nextPassword = passwordChanged ? password : old.password;
    const updated = {
      ...old,
      email: nextEmail,
      phone: phone.trim(),
      password: nextPassword,
    };
    setUsers((prev) => prev.map((u, i) => (i === idx ? updated : u)));
    void sendUserAccountUpdatedEmail({
      to: updated.email,
      phone: updated.phone,
      passwordChanged,
      newPassword: nextPassword,
      adminEmail: currentUser.email,
    }).then((result) => setMailToast(result));
    return { ok: true };
  }

  function addTicket({ title, description, assignedEmail, status }) {
    const ticket = {
      id: String(Date.now()),
      title: title.trim(),
      description: description.trim(),
      assignedEmail: assignedEmail.trim(),
      status,
      createdBy: currentUser.email,
    };
    setTickets((prev) => [...prev, ticket]);
    void sendMailToAssignee({
      action: "create",
      ticket,
      actorEmail: currentUser.email,
    }).then((result) => setMailToast(result));
  }

  function updateTicket(id, { title, description, assignedEmail, status }) {
    let updated = null;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        updated = {
          ...t,
          title: title.trim(),
          description: description.trim(),
          assignedEmail: assignedEmail.trim(),
          status,
        };
        return updated;
      })
    );
    if (updated) {
      void sendMailToAssignee({
        action: "update",
        ticket: updated,
        actorEmail: currentUser.email,
      }).then((result) => setMailToast(result));
    }
  }

  function deleteTicket(id) {
    const target = ticketsRef.current.find((t) => t.id === id);
    setTickets((prev) => prev.filter((t) => t.id !== id));
    if (target) {
      void sendMailToAssignee({
        action: "delete",
        ticket: target,
        actorEmail: currentUser.email,
      }).then((result) => setMailToast(result));
    }
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
  if (!ctx) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return ctx;
}
