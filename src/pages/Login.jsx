import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Login() {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  if (currentUser) {
    return (
      <Navigate
        to={currentUser.role === "admin" ? "/admin" : "/home"}
        replace
      />
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (email.trim() === "") {
      setMessage("Please enter email");
      return;
    }
    if (password === "") {
      setMessage("Please enter password");
      return;
    }

    const result = login(email, password);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    if (result.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/home", { replace: true });
    }
  }

  return (
    <div className="page">
      <div className="box">
        <h1>Login</h1>
        <p className="hint">
          Demo admin: admin@example.com / admin123
          <br />
          Regular users are created by admin.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </div>

          <button type="submit" className="btn">
            Sign in
          </button>
        </form>

        {message !== "" && <p className="msg error">{message}</p>}
      </div>
    </div>
  );
}