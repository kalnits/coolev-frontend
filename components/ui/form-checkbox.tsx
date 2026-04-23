"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

type FormCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  description?: string;
};

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, description, className = "", id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <label htmlFor={checkboxId} className={`form-checkbox-label ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className="form-checkbox"
          {...props}
        />
        <span className="form-checkbox-indicator" />
        <span className="form-checkbox-content">
          <span className="form-checkbox-text">{label}</span>
          {description ? (
            <span className="form-checkbox-description">{description}</span>
          ) : null}
        </span>
      </label>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";

type FormCheckboxGroupProps = {
  label?: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
};

export function FormCheckboxGroup({ label, children, error, className = "" }: FormCheckboxGroupProps) {
  return (
    <fieldset className={`form-field ${error ? "form-field-error" : ""} ${className}`}>
      {label ? <legend className="form-label">{label}</legend> : null}
      <div className="form-checkbox-group">{children}</div>
      {error ? <span className="form-error">{error}</span> : null}
    </fieldset>
  );
}
