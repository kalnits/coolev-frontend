"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

type FormSwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  description?: string;
};

export const FormSwitch = forwardRef<HTMLInputElement, FormSwitchProps>(
  ({ label, description, className = "", id, ...props }, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <label htmlFor={switchId} className={`form-switch-label ${className}`}>
        <span className="form-switch-content">
          <span className="form-switch-text">{label}</span>
          {description ? (
            <span className="form-switch-description">{description}</span>
          ) : null}
        </span>
        <span className="form-switch">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            className="form-switch-input"
            role="switch"
            {...props}
          />
          <span className="form-switch-track" />
        </span>
      </label>
    );
  }
);

FormSwitch.displayName = "FormSwitch";
