"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

type FormRadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  description?: string;
};

export const FormRadio = forwardRef<HTMLInputElement, FormRadioProps>(
  ({ label, description, className = "", id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <label htmlFor={radioId} className={`form-radio-label ${className}`}>
        <input
          ref={ref}
          type="radio"
          id={radioId}
          className="form-radio"
          {...props}
        />
        <span className="form-radio-indicator" />
        <span className="form-radio-content">
          <span className="form-radio-text">{label}</span>
          {description ? (
            <span className="form-radio-description">{description}</span>
          ) : null}
        </span>
      </label>
    );
  }
);

FormRadio.displayName = "FormRadio";

type FormRadioGroupProps = {
  label?: string;
  name: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
};

export function FormRadioGroup({ label, name, children, error, className = "" }: FormRadioGroupProps) {
  return (
    <fieldset className={`form-field ${error ? "form-field-error" : ""} ${className}`} role="radiogroup">
      {label ? <legend className="form-label">{label}</legend> : null}
      <div className="form-radio-group" data-name={name}>{children}</div>
      {error ? <span className="form-error">{error}</span> : null}
    </fieldset>
  );
}
