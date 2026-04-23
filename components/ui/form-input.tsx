"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Icon, type IconName } from "./icons";

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  icon?: IconName;
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, icon, className = "", id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const hasValue = Boolean(props.value || props.defaultValue);

    return (
      <div className={`form-field ${error ? "form-field-error" : ""} ${className}`}>
        <div className={`form-input-wrapper ${isFocused ? "focused" : ""} ${hasValue ? "has-value" : ""}`}>
          {icon ? (
            <span className="form-input-icon">
              <Icon name={icon} size={18} />
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            className={`form-input ${icon ? "with-icon" : ""}`}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {label ? (
            <label htmlFor={inputId} className="form-input-label">
              {label}
            </label>
          ) : null}
        </div>
        {error ? <span className="form-error">{error}</span> : null}
        {hint && !error ? <span className="form-hint">{hint}</span> : null}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
