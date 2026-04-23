"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { clearAccountSession, readAccountSession } from "../lib/account-session";
import type { AccountSession } from "../lib/types";
import { Icon } from "./ui/icons";

export function Header() {
  const [session, setSession] = useState<AccountSession | null>(null);

  useEffect(() => {
    setSession(readAccountSession());
  }, []);

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark">CoolEv</span> Dog Care
      </Link>
      <nav className="nav-row">
        <Link className="nav-button" href="/find">
          <Icon name="search" size={18} />
          Find
        </Link>
        <Link className="nav-button" href="/become-a-sitter">
          <Icon name="paw" size={18} />
          Become a sitter
        </Link>
        {session?.role === "admin" ? (
          <Link className="nav-button" href="/admin/sitter-applications">
            <Icon name="shield" size={18} />
            Admin
          </Link>
        ) : null}
        {session ? (
          <>
            <Link className="nav-button" href="/account">
              <Icon name="user" size={18} />
              Account
            </Link>
            <button
              className="nav-button"
              onClick={() => {
                clearAccountSession();
                window.location.href = "/";
              }}
              type="button"
            >
              <Icon name="log-out" size={18} />
              Log out
            </button>
          </>
        ) : (
          <Link className="nav-button" href="/auth">
            <Icon name="log-in" size={18} />
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
