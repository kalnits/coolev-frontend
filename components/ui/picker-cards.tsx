"use client";

import { Icon, type IconName } from "./icons";

type PickerOption = {
  value: string;
  label: string;
  note?: string;
  icon?: IconName;
};

type SinglePickerProps = {
  name: string;
  options: PickerOption[];
  value: string;
  onChange: (value: string) => void;
};

type MultiPickerProps = {
  name: string;
  options: PickerOption[];
  values: string[];
  onChange: (values: string[]) => void;
};

export function SinglePickerCards({ name, options, value, onChange }: SinglePickerProps) {
  return (
    <div className="picker-stack">
      <input name={name} type="hidden" value={value} />
      <div className="picker-grid">
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              className={isActive ? "picker-card active" : "picker-card"}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.icon ? (
                <span className={`picker-icon ${isActive ? "picker-icon-active" : ""}`}>
                  <Icon name={option.icon} size={18} strokeWidth={1.75} />
                </span>
              ) : null}
              <strong>{option.label}</strong>
              {option.note ? <span>{option.note}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MultiPickerCards({ name, options, values, onChange }: MultiPickerProps) {
  function toggleValue(nextValue: string) {
    if (values.includes(nextValue)) {
      onChange(values.filter((v) => v !== nextValue));
      return;
    }
    onChange([...values, nextValue]);
  }

  return (
    <div className="picker-stack">
      {values.map((v) => (
        <input key={v} name={name} type="hidden" value={v} />
      ))}
      <div className="picker-grid compact">
        {options.map((option) => {
          const isActive = values.includes(option.value);
          return (
            <button
              key={option.value}
              className={isActive ? "picker-card active" : "picker-card"}
              onClick={() => toggleValue(option.value)}
              type="button"
            >
              {option.icon ? (
                <span className={`picker-icon ${isActive ? "picker-icon-active" : ""}`}>
                  <Icon name={option.icon} size={18} strokeWidth={1.75} />
                </span>
              ) : null}
              <strong>{option.label}</strong>
              {option.note ? <span>{option.note}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
