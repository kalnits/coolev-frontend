"use client";

type PickerOption = {
  value: string;
  label: string;
  note?: string;
  icon?: string;
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
        {options.map((option) => (
          <button
            key={option.value}
            className={option.value === value ? "picker-card active" : "picker-card"}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.icon ? <span className="picker-icon">{option.icon}</span> : null}
            <strong>{option.label}</strong>
            {option.note ? <span>{option.note}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MultiPickerCards({ name, options, values, onChange }: MultiPickerProps) {
  function toggleValue(nextValue: string) {
    if (values.includes(nextValue)) {
      onChange(values.filter((value) => value !== nextValue));
      return;
    }
    onChange([...values, nextValue]);
  }

  return (
    <div className="picker-stack">
      {values.map((value) => (
        <input key={value} name={name} type="hidden" value={value} />
      ))}
      <div className="picker-grid compact">
        {options.map((option) => (
          <button
            key={option.value}
            className={values.includes(option.value) ? "picker-card active" : "picker-card"}
            onClick={() => toggleValue(option.value)}
            type="button"
          >
            {option.icon ? <span className="picker-icon">{option.icon}</span> : null}
            <strong>{option.label}</strong>
            {option.note ? <span>{option.note}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
