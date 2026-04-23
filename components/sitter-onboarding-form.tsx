"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { registerSitter } from "../lib/api";
import { writeAccountSession, writeSitterProfile } from "../lib/account-session";
import type { RegisterSitterResponse } from "../lib/types";
import { AddressAutocompleteInput } from "./ui/address-autocomplete-input";

type SitterOnboardingFormProps = {
  onRegistered?: (payload: RegisterSitterResponse) => void;
};

export function SitterOnboardingForm({ onRegistered }: SitterOnboardingFormProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState({
    address: "",
    city: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setStatus(null);
    try {
      const serviceTypes = formData.getAll("serviceTypes").map(String);
      const payload = await registerSitter({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        full_name: String(formData.get("fullName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        city: location.city || String(formData.get("city") ?? ""),
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        bio: String(formData.get("bio") ?? ""),
        service_types: serviceTypes.length > 0 ? serviceTypes : ["walking"]
      });
      writeAccountSession(payload.session);
      writeSitterProfile(payload.profile);
      setStatus("Account created and signed in. Finish your sitter profile below.");
      onRegistered?.(payload);
    } catch {
      setStatus("Could not create the account right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel-form" onSubmit={(event) => void handleSubmit(event)}>
      <fieldset className="checkbox-group">
        <legend>Services</legend>
        <label>
          <input defaultChecked name="serviceTypes" type="checkbox" value="boarding" />
          Boarding
        </label>
        <label>
          <input defaultChecked name="serviceTypes" type="checkbox" value="walking" />
          Walking
        </label>
      </fieldset>
      <label>
        Full name
        <input name="fullName" required />
      </label>
      <label>
        Email
        <input name="email" required type="email" />
      </label>
      <label>
        Phone
        <input name="phone" required />
      </label>
      <label>
        Password
        <input minLength={8} name="password" required type="password" />
      </label>
      <label>
        Address
        <AddressAutocompleteInput
          onChange={setLocation}
          required
          value={location}
        />
        <input name="city" type="hidden" value={location.city || location.address} />
      </label>
      <label>
        Free description
        <textarea name="bio" required rows={5} />
      </label>
      <button className="primary-cta" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating account..." : "Create sitter account"}
      </button>
      {status ? <p className="status-copy">{status}</p> : null}
    </form>
  );
}
