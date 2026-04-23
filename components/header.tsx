"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { clearAccountSession, readAccountSession } from "../lib/account-session";
import type { AccountSession } from "../lib/types";

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
        <Link href="/find">Find</Link>
        <Link href="/become-a-sitter">Become a sitter</Link>
        {session?.role === "admin" ? <Link href="/admin/sitter-applications">Admin approvals</Link> : null}
        {session ? (
          <>
            <Link href="/account">Account</Link>
            <button
              className="nav-button"
              onClick={() => {
                clearAccountSession();
                window.location.href = "/";
              }}
              type="button"
            >
              Log out
            </button>
          </>
        ) : (
          <Link href="/auth">Login</Link>
        )}
      </nav>
    </header>
  );
}
