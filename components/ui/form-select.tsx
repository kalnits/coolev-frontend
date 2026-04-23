"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { Icon } from "./icons";

type SelectOption = {
  value: string;
  label: string;
};

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
};

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, hint, options, placeholder, className = "", id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={`form-field ${error ? "form-field-error" : ""} ${className}`}>
        {label ? (
          <label htmlFor={selectId} className="form-label">
            {label}
          </label>
        ) : null}
        <div className="form-select-wrapper">
          <select
            ref={ref}
            id={selectId}
            className="form-select"
            {...props}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="form-select-icon">
            <Icon name="chevron-down" size={18} />
          </span>
        </div>
        {error ? <span className="form-error">{error}</span> : null}
        {hint && !error ? <span className="form-hint">{hint}</span> : null}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
