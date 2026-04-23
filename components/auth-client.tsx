"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { login, registerOwner } from "../lib/api";
import { readAccountSession, writeAccountSession } from "../lib/account-session";

type AuthClientProps = {
  next?: string;
};

export function AuthClient({ next }: AuthClientProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const session = readAccountSession();
    if (session && next) {
      window.location.href = next;
    }
  }, [next]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    }
  }

  return (
    <div className="auth-shell">
      <div className="story-card compact-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Account</p>
            <h2>{mode === "login" ? "Log in" : "Create customer account"}</h2>
          </div>
        </div>
        <div className="cta-row">
          <button className={mode === "login" ? "primary-cta" : "secondary-cta"} onClick={() => setMode("login")} type="button">
            Login
          </button>
          <button className={mode === "register" ? "primary-cta" : "secondary-cta"} onClick={() => setMode("register")} type="button">
            Register
          </button>
        </div>
      </div>
      {mode === "login" ? (
        <form className="panel-form" onSubmit={(event) => void handleLogin(event)}>
          <label>
            Email
            <input name="email" required type="email" />
          </label>
          <label>
            Password
            <input name="password" required type="password" />
          </label>
          <button className="primary-cta" type="submit">
            Log in
          </button>
        </form>
      ) : (
        <form className="panel-form" onSubmit={(event) => void handleRegister(event)}>
          <label>
            Full name
            <input name="fullName" required />
          </label>
          <label>
            Email
            <input name="email" required type="email" />
          </label>
          <label>
            Phone
            <input name="phone" required />
          </label>
          <label>
            Password
            <input minLength={8} name="password" required type="password" />
          </label>
          <button className="primary-cta" type="submit">
            Create customer account
          </button>
        </form>
      )}
      {status ? <p className="status-copy">{status}</p> : null}
      <div className="story-card compact-card">
        <h2>Admin</h2>
        <div className="detail-list">
          <p><strong>Email:</strong> admin@coolev.local</p>
          <p><strong>Password:</strong> admin12345</p>
        </div>
      </div>
    </div>
  );
}
