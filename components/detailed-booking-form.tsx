"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { createBookingRequest, fetchOwnerDashboard, normalizeAssetUrl, saveOwnerPet, uploadImage } from "../lib/api";
import { readAccountSession } from "../lib/account-session";
import type { AvailabilityRange, OwnerDashboard } from "../lib/types";
import { SinglePickerCards } from "./ui/picker-cards";
import { SiteModal } from "./ui/site-modal";
import { AvailabilityCalendar } from "./ui/availability-calendar";

type DetailedBookingFormProps = {
  sitterId: number;
  defaultServiceType: string;
  defaultFromDate?: string;
  defaultToDate?: string;
  defaultStartsAt?: string;
  availabilityByService?: Record<string, AvailabilityRange[]>;
};

const serviceOptions = [
  { value: "walking", label: "Walking", note: "Daily walk", icon: "🦮" },
  { value: "boarding", label: "Boarding", note: "Overnight care", icon: "🏡" },
];

export function DetailedBookingForm({
  sitterId,
  defaultServiceType,
  defaultFromDate,
  defaultToDate,
  defaultStartsAt,
  availabilityByService = {},
}: DetailedBookingFormProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [ownerSession, setOwnerSession] = useState<ReturnType<typeof readAccountSession>>(null);
  const [ownerDashboard, setOwnerDashboard] = useState<OwnerDashboard | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [serviceType, setServiceType] = useState(defaultServiceType);
  const [fromDate, setFromDate] = useState(defaultFromDate ?? "");
  const [toDate, setToDate] = useState(defaultToDate ?? "");
  const [startsAt, setStartsAt] = useState(defaultStartsAt ?? "");
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);

  useEffect(() => {
    const session = readAccountSession();
    setOwnerSession(session);
    if (session?.role === "owner") {
      void fetchOwnerDashboard(session.user_id).then((dashboard) => {
        setOwnerDashboard(dashboard);
        if (dashboard.pets[0]) {
          setSelectedPetId(String(dashboard.pets[0].id));
        }
      });
    }
  }, []);

  const availabilityRanges = availabilityByService[serviceType] ?? [];
  const selectionIsAvailable = useMemo(
    () => matchesAvailability(availabilityRanges, serviceType, fromDate, toDate, startsAt),
    [availabilityRanges, fromDate, serviceType, startsAt, toDate],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ownerSession || ownerSession.role !== "owner") {
      window.location.href = `/auth?next=/book/${sitterId}`;
      return;
    }
    if (!selectionIsAvailable) {
      setStatus("Those dates are outside the sitter's available time.");
      return;
    }
    const formData = new FormData(event.currentTarget);
    const selectedPet = ownerDashboard?.pets.find((pet) => String(pet.id) === selectedPetId);
    const bookingWindow = buildBookingWindow(serviceType, fromDate, toDate, startsAt);
    try {
      const result = await createBookingRequest({
        owner_user_id: ownerSession.user_id,
        sitter_profile_id: sitterId,
        service_type: serviceType,
        starts_at: bookingWindow?.starts_at,
        ends_at: bookingWindow?.ends_at,
        message: String(formData.get("message") ?? ""),
        owner_email: ownerSession.email,
        owner_full_name: ownerSession.full_name,
        owner_phone: String(formData.get("ownerPhone") ?? ""),
        pet_name: selectedPet?.name,
        pet_photo_url: normalizeAssetUrl(selectedPet?.photo_url),
        pet_breed: selectedPet?.breed,
        pet_weight_kg: selectedPet?.weight_kg ? Number(selectedPet.weight_kg) : undefined,
        pet_training_level: selectedPet?.training_level,
      });
      setStatus(`Request #${result.id} sent${selectedPet?.name ? ` for ${selectedPet.name}` : ""}.`);
    } catch {
      setStatus("Could not submit the booking request.");
    }
  }

  async function handlePetSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ownerSession || ownerSession.role !== "owner") return;
    const formData = new FormData(event.currentTarget);
    const photoFile = formData.get("photo") instanceof File ? (formData.get("photo") as File) : null;
    const uploadedPhoto = photoFile && photoFile.size > 0 ? await uploadImage(photoFile) : null;
    const pet = await saveOwnerPet(ownerSession.user_id, {
      name: String(formData.get("name") ?? ""),
      photo_url: uploadedPhoto?.url,
      breed: String(formData.get("breed") ?? ""),
      weight_kg: String(formData.get("weightKg") ?? ""),
      training_level: String(formData.get("trainingLevel") ?? ""),
      care_notes: String(formData.get("careNotes") ?? ""),
    });
    setOwnerDashboard((current) =>
      current
        ? { ...current, pets: [pet, ...current.pets.filter((item) => item.id !== pet.id)] }
        : { pets: [pet], bookings: [], pet_reviews: [] },
    );
    setSelectedPetId(String(pet.id));
    setIsPetModalOpen(false);
  }

  if (!ownerSession || ownerSession.role !== "owner") {
    return (
      <div className="panel-form booking-panel">
        <h2>Login required</h2>
        <p>Customer account needed before booking.</p>
        <a className="primary-cta" href={`/auth?next=/book/${sitterId}`}>
          Login or register
        </a>
      </div>
    );
  }

  const selectedPet = ownerDashboard?.pets.find((pet) => String(pet.id) === selectedPetId) ?? null;

  return (
    <>
      <form className="panel-form booking-panel compact-booking-form" onSubmit={(event) => void handleSubmit(event)}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Booking</p>
            <h2>Send request</h2>
          </div>
          <button className="secondary-cta" onClick={() => setIsPetModalOpen(true)} type="button">
            {ownerDashboard?.pets.length ? "Add pet" : "Add your dog"}
          </button>
        </div>

        <label>
          Service
          <SinglePickerCards name="servicePreview" onChange={setServiceType} options={serviceOptions} value={serviceType} />
        </label>

        {serviceType === "boarding" ? (
          <div className="search-grid">
            <label>
              Drop off
              <input
                name="fromDate"
                onChange={(event) => {
                  const nextFromDate = event.target.value;
                  setFromDate(nextFromDate);
                  const suggestedToDate = addDaysToDateValue(nextFromDate, 2);
                  if (!toDate || toDate <= nextFromDate) {
                    setToDate(suggestedToDate);
                  }
                }}
                required
                type="date"
                value={fromDate}
              />
            </label>
            <label>
              Pick up
              <input name="toDate" onChange={(event) => setToDate(event.target.value)} required type="date" value={toDate} />
            </label>
          </div>
        ) : (
          <label>
            Date and time
            <input name="startsAt" onChange={(event) => setStartsAt(event.target.value)} required type="datetime-local" value={startsAt} />
          </label>
        )}

        <AvailabilityCalendar
          fromDate={fromDate}
          ranges={availabilityRanges}
          startsAt={startsAt}
          toDate={toDate}
        />

        <div className="story-card compact-card">
          <p className={selectionIsAvailable ? "status-copy" : "status-copy error-copy"}>
            {selectionIsAvailable ? "Selected time fits the sitter's availability." : "Selected time is outside the sitter's availability."}
          </p>
        </div>

        <div className="dynamic-filter-stack">
          <div className="section-head">
            <strong>Your dog</strong>
            {!ownerDashboard?.pets.length ? <span className="status-copy">No saved pets yet</span> : null}
          </div>
          {ownerDashboard?.pets.length ? (
            <div className="pet-choice-grid">
              {ownerDashboard.pets.map((pet) => (
                <button
                  key={pet.id}
                  className={String(pet.id) === selectedPetId ? "pet-choice-card active" : "pet-choice-card"}
                  onClick={() => setSelectedPetId(String(pet.id))}
                  type="button"
                >
                  {normalizeAssetUrl(pet.photo_url) ? <div className="pet-choice-photo" style={{ backgroundImage: `url(${normalizeAssetUrl(pet.photo_url)})` }} /> : <div className="pet-choice-photo placeholder">🐶</div>}
                  <strong>{pet.name}</strong>
                  <span>{pet.breed || "Profile saved"}</span>
                </button>
              ))}
            </div>
          ) : (
            <button className="secondary-cta" onClick={() => setIsPetModalOpen(true)} type="button">
              Add first pet
            </button>
          )}
        </div>

        {selectedPet ? (
          <div className="story-card compact-card">
            <div className="detail-list">
              <p><strong>{selectedPet.name}</strong></p>
              <p>{selectedPet.breed || "Breed not set"} · {selectedPet.weight_kg || "Weight not set"} kg</p>
              <p>{selectedPet.training_level || "Training level not set"}</p>
            </div>
          </div>
        ) : null}

        <label>
          Phone
          <input name="ownerPhone" placeholder="050..." />
        </label>
        <label>
          Message
          <textarea name="message" rows={4} />
        </label>
        <button className="primary-cta" disabled={!selectionIsAvailable} type="submit">
          Send booking request
        </button>
        {status ? <p className={selectionIsAvailable ? "status-copy" : "status-copy error-copy"}>{status}</p> : null}
      </form>

      <SiteModal
        actions={
          <button className="secondary-cta" onClick={() => setIsPetModalOpen(false)} type="button">
            Close
          </button>
        }
        isOpen={isPetModalOpen}
        onClose={() => setIsPetModalOpen(false)}
        title="Pet profile"
      >
        <form className="dynamic-filter-stack" onSubmit={(event) => void handlePetSave(event)}>
          <label>
            Pet name
            <input name="name" required />
          </label>
          <label>
            Photo
            <input accept="image/*" name="photo" type="file" />
          </label>
          <div className="search-grid">
            <label>
              Breed
              <input name="breed" />
            </label>
            <label>
              Weight
              <input name="weightKg" type="number" />
            </label>
          </div>
          <label>
            Training level
            <input name="trainingLevel" />
          </label>
          <label>
            Care notes
            <textarea name="careNotes" rows={4} />
          </label>
          <button className="primary-cta" type="submit">
            Save pet
          </button>
        </form>
      </SiteModal>
    </>
  );
}

function buildBookingWindow(
  serviceType: string,
  fromDate: string,
  toDate: string,
  startsAt: string,
) {
  if (serviceType === "walking") {
    if (!startsAt) return null;
    const start = new Date(startsAt);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { starts_at: start.toISOString(), ends_at: end.toISOString() };
  }
  if (!fromDate || !toDate) return null;
  return {
    starts_at: new Date(`${fromDate}T00:00:00`).toISOString(),
    ends_at: new Date(`${toDate}T23:59:59`).toISOString(),
  };
}

function matchesAvailability(
  ranges: AvailabilityRange[],
  serviceType: string,
  fromDate: string,
  toDate: string,
  startsAt: string,
) {
  const bookingWindow = buildBookingWindow(serviceType, fromDate, toDate, startsAt);
  if (!bookingWindow) return false;
  const bookingStart = new Date(bookingWindow.starts_at);
  const bookingEnd = new Date(bookingWindow.ends_at);
  return ranges.some((range) => {
    const rangeStart = new Date(range.starts_at);
    const rangeEnd = new Date(range.ends_at);
    return rangeStart <= bookingStart && rangeEnd >= bookingEnd;
  });
}

function addDaysToDateValue(value: string, days: number) {
  const base = new Date(`${value}T00:00:00`);
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}
