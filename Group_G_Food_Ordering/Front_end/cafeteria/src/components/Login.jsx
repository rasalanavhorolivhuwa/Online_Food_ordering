import React, { useState } from "react";
import { api } from "../api";
import { Spinner } from "./Loader";

const EMAIL_PATTERN = /^\d+@mvula\.univen\.ac\.za$/;

export function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const normalised = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalised)) {
      setError("Use your UNIVEN student email, for example 12345678@mvula.univen.ac.za.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      onLogin(await api.login({ email: normalised, password }));
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="uni-mark">UV</div>
        <p className="kicker">UNIVERSITY OF VENDA</p>
        <h1>Campus food, made simple.</h1>
        <p className="login-copy">
          Sign in with your UNIVEN student email to order from campus restaurants.
        </p>
        <form onSubmit={submit} noValidate>
          <label htmlFor="email">Student email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="12345678@mvula.univen.ac.za"
            autoComplete="username"
            required
          />
          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading}>
            {loading ? <><Spinner /> Signing in…</> : "Sign in"}
          </button>
        </form>
        <p className="login-note">
          Only active University of Venda student email addresses are accepted.
        </p>
      </section>
    </main>
  );
}
