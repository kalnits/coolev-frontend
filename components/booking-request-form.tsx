"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { createBookingRequest } from "../lib/api";

type BookingRequestFormProps = {
  sitterId: number;
  defaultServiceType: string;
};

export function BookingRequestForm({
  sitterId,
  defaultServiceType
}: BookingRequestFormProps) {
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      const result = await createBookingRequest({
        sitter_profile_id: sitterId,
        service_type: String(formData.get("serviceType") ?? defaultServiceType),
        message: String(formData.get("message") ?? ""),
        owner_email: String(formData.get("ownerEmail") ?? ""),
        owner_full_name: String(formData.get("ownerFullName") ?? ""),
        owner_phone: String(formData.get("ownerPhone") ?? "")
      });
      setStatus(`Request #${result.id} sent and saved.`);
    } catch {
      setStatus("Could not send the booking request.");
    }
  }

  return (
    <form className="panel-form booking-panel" onSubmit={(event) => void handleSubmit(event)}>
      <h2>Request dog care</h2>
      <label>
        Your name
        <input name="ownerFullName" />
      </label>
      <label>
        Your email
        <input name="ownerEmail" type="email" />
      </label>
      <label>
        Your phone
        <input name="ownerPhone" />
      </label>
      <label>
        Service
        <select defaultValue={defaultServiceType} name="serviceType">
          <option value="walking">Walking</option>
          <option value="boarding">Boarding</option>
        </select>
      </label>
      <label>
        Message
        <textarea name="message" rows={5} />
      </label>
      <button className="primary-cta" type="submit">
        Request to book
      </button>
      {status ? <p className="status-copy">{status}</p> : null}
    </form>
  );
}
