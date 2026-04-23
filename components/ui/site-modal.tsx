"use client";

import type { ReactNode } from "react";

type SiteModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
};

export function SiteModal({ title, isOpen, onClose, children, actions }: SiteModalProps) {
  if (!isOpen) return null;

  return (
    <div aria-label={title} aria-modal="true" className="filter-modal-backdrop" onClick={onClose} role="dialog">
      <div className="filter-modal large-modal" onClick={(event) => event.stopPropagation()}>
        <div className="filter-modal-header">
          <h2>{title}</h2>
          <button aria-label={`Close ${title}`} className="filter-close" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {actions ? <div className="filter-modal-actions">{actions}</div> : null}
      </div>
    </div>
  );
}
