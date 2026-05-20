import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UserHome from "./pages/UserHome.jsx";
import CreateTicket from "./pages/CreateTicket.jsx";
import TicketList from "./pages/TicketList.jsx";
import EditTicket from "./pages/EditTicket.jsx";

function RootRedirect() {
  const { currentUser } = useApp();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/home" replace />;
}

function MailToastHost() {
  const { mailToast, dismissMailToast } = useApp();
  if (!mailToast) return null;
  return (
    <div className="mail-toast" role="status">
      <div className="mail-toast-body">
        <strong>Assignee notification</strong>
        <p>{mailToast.summary}</p>
        {mailToast.subject && (
          <p className="mail-toast-sub">Subject: {mailToast.subject}</p>
        )}
      </div>
      <button type="button" className="mail-toast-close" onClick={dismissMailToast}>
        ×
      </button>
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/home" element={<UserHome />} />
        <Route path="/tickets" element={<TicketList />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/tickets/:id/edit" element={<EditTicket />} />
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
      <MailToastHost />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
