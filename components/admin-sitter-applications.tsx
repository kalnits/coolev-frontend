"use client";

import { useState } from "react";

import { approveAdminSitterApplication } from "../lib/api";
import type { AdminSitterApplication } from "../lib/types";

type AdminSitterApplicationsProps = {
  applications: AdminSitterApplication[];
};

export function AdminSitterApplications({ applications }: AdminSitterApplicationsProps) {
  const [items, setItems] = useState(applications);
  const [status, setStatus] = useState<string | null>(null);

  async function handleApprove(applicationId: number) {
    try {
      await approveAdminSitterApplication(applicationId);
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === applicationId ? { ...item, publication_status: "approved" } : item
        )
      );
      setStatus(`Application #${applicationId} approved. The sitter is now visible in search.`);
    } catch {
      setStatus("Could not approve the sitter application.");
    }
  }

  return (
    <section className="panel-form">
      <h2>Sitter applications</h2>
      <p>Approve pending sitters so they become visible in search results.</p>
      <div className="application-list">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className="application-card">
              <div>
                <strong>{item.display_name}</strong>
                <p className="status-copy">Status: {item.publication_status.replaceAll("_", " ")}</p>
              </div>
              {item.publication_status === "pending_approval" ? (
                <button className="primary-cta" onClick={() => void handleApprove(item.id)} type="button">
                  Approve
                </button>
              ) : (
                <span className="badge-chip">Approved</span>
              )}
            </article>
          ))
        ) : (
          <p className="status-copy">No sitter applications are waiting for approval.</p>
        )}
      </div>
      {status ? <p className="status-copy">{status}</p> : null}
    </section>
  );
}
