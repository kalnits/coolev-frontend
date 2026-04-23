"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { login, registerOwner } from "../lib/api";
import { readAccountSession, writeAccountSession } from "../lib/account-session";
import { Icon } from "./ui/icons";

type AuthClientProps = {
  next?: string;
};

export function AuthClient({ next }: AuthClientProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const session = readAccountSession();
    if (session && next) {
      window.location.href = next;
    }
  }, [next]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await login({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? "")
      });
      writeAccountSession(response.session);
      window.location.href = next || "/account";
    } catch {
      setStatus("Could not log in with those credentials.");
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await registerOwner({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        full_name: String(formData.get("fullName") ?? ""),
        phone: String(formData.get("phone") ?? "")
      });
      writeAccountSession(response.session);
      window.location.href = next || "/account";
    } catch {
      setStatus("Could not create the owner account.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="story-card compact-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Account</p>
            <h2>{mode === "login" ? "Welcome back" : "Join CoolEv"}</h2>
          </div>
        </div>
        <p style={{ color: "var(--muted)", marginTop: "var(--space-2)" }}>
          {mode === "login" 
            ? "Log in to manage your bookings and pets." 
            : "Create an account to book trusted dog care."}
        </p>
        <div className="cta-row" style={{ marginTop: "var(--space-4)" }}>
          <button 
            className={mode === "login" ? "primary-cta" : "secondary-cta"} 
            onClick={() => { setMode("login"); setStatus(null); }} 
            type="button"
          >
            <Icon name="log-in" size={16} />
            Login
          </button>
          <button 
            className={mode === "register" ? "primary-cta" : "secondary-cta"} 
            onClick={() => { setMode("register"); setStatus(null); }} 
            type="button"
          >
            <Icon name="user" size={16} />
            Register
          </button>
        </div>
      </div>

      {mode === "login" ? (
        <form className="panel-form" onSubmit={(event) => void handleLogin(event)}>
          <label>
            <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Icon name="mail" size={16} />
              Email
            </span>
            <input name="email" placeholder="you@example.com" required type="email" />
          </label>
          <label>
            <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Icon name="shield" size={16} />
              Password
            </span>
            <input name="password" placeholder="Enter your password" required type="password" />
          </label>
          <button className="primary-cta" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>
      ) : (
        <form className="panel-form" onSubmit={(event) => void handleRegister(event)}>
          <label>
            <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Icon name="user" size={16} />
              Full name
            </span>
            <input name="fullName" placeholder="Your full name" required />
          </label>
          <label>
            <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Icon name="mail" size={16} />
              Email
            </span>
            <input name="email" placeholder="you@example.com" required type="email" />
          </label>
          <label>
            <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Icon name="phone" size={16} />
              Phone
            </span>
            <input name="phone" placeholder="050-XXX-XXXX" required />
          </label>
          <label>
            <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Icon name="shield" size={16} />
              Password
            </span>
            <input minLength={8} name="password" placeholder="At least 8 characters" required type="password" />
          </label>
          <button className="primary-cta" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating account..." : "Create customer account"}
          </button>
        </form>
      )}

      {status ? (
        <div className="story-card compact-card" style={{ borderColor: "var(--error)", background: "var(--error-light)" }}>
          <p className="error-copy" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", margin: 0 }}>
            <Icon name="alert" size={16} />
            {status}
          </p>
        </div>
      ) : null}

      <div className="story-card compact-card" style={{ opacity: 0.8 }}>
        <p className="eyebrow">Demo credentials</p>
        <div className="detail-list" style={{ marginTop: "var(--space-2)" }}>
          <p><strong>Admin:</strong> admin@coolev.local / admin12345</p>
        </div>
      </div>
    </div>
  );
}
