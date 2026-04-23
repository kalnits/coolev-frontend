"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { createAdminField } from "../lib/api";
import type { AdminFormSummary } from "../lib/types";

type AdminSchemaManagerProps = {
  forms: AdminFormSummary[];
};

export function AdminSchemaManager({ forms }: AdminSchemaManagerProps) {
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await createAdminField("sitter_profile", {
        section_title: String(formData.get("sectionTitle") ?? "Home details"),
        field_key: String(formData.get("fieldKey") ?? ""),
        label: String(formData.get("label") ?? ""),
        field_type: String(formData.get("fieldType") ?? "boolean"),
        is_public: true,
        is_filterable: formData.get("isFilterable") === "on",
        options: []
      });
      setStatus("Field created. Refresh to see the updated schema.");
    } catch {
      setStatus("Could not create the field.");
    }
  }

  return (
    <div className="admin-grid">
      <section className="story-card">
        <h2>Current schema</h2>
        {forms.map((form) => (
          <div key={form.key} className="schema-block">
            <h3>{form.title}</h3>
            {form.sections.map((section) => (
              <div key={section.title}>
                <strong>{section.title}</strong>
                <ul className="trust-list">
                  {section.fields.map((field) => (
                    <li key={field.field_key}>
                      {field.label} · {field.field_type}
                      {field.is_filterable ? " · filterable" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </section>
      <form className="panel-form" onSubmit={(event) => void handleSubmit(event)}>
        <h2>Add field</h2>
        <label>
          Section title
          <input defaultValue="Home details" name="sectionTitle" />
        </label>
        <label>
          Field key
          <input name="fieldKey" />
        </label>
        <label>
          Label
          <input name="label" />
        </label>
        <label>
          Field type
          <select defaultValue="boolean" name="fieldType">
            <option value="boolean">Boolean</option>
            <option value="select">Select</option>
            <option value="multi-select">Multi-select</option>
            <option value="number">Number</option>
          </select>
        </label>
        <label className="inline-check">
          <input name="isFilterable" type="checkbox" />
          Filterable
        </label>
        <button className="primary-cta" type="submit">
          Create field
        </button>
        {status ? <p className="status-copy">{status}</p> : null}
      </form>
    </div>
  );
}
