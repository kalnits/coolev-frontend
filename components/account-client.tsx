"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useEffect, useState } from "react";

import { fetchOwnerDashboard, fetchSitterDashboard, normalizeAssetUrl, saveOwnerPet, uploadImage } from "../lib/api";
import { clearAccountSession, readAccountSession } from "../lib/account-session";
import type { AccountSession, OwnerDashboard, SitterDashboard } from "../lib/types";
import { SitterProfileSetup } from "./sitter-profile-setup";
import { SiteModal } from "./ui/site-modal";

const emptyOwnerDashboard: OwnerDashboard = { pets: [], bookings: [], pet_reviews: [] };

export function AccountClient() {
  const [session, setSession] = useState<AccountSession | null>(null);
  const [ownerDashboard, setOwnerDashboard] = useState<OwnerDashboard>(emptyOwnerDashboard);
  const [sitterDashboard, setSitterDashboard] = useState<SitterDashboard | null>(null);

  useEffect(() => {
    const currentSession = readAccountSession();
    if (!currentSession) {
      window.location.href = "/auth?next=/account";
      return;
    }
    setSession(currentSession);
    if (currentSession.role === "owner") {
      void fetchOwnerDashboard(currentSession.user_id).then(setOwnerDashboard).catch(() => undefined);
    }
    if (currentSession.role === "sitter" && currentSession.sitter_profile_id) {
      void fetchSitterDashboard(currentSession.sitter_profile_id).then(setSitterDashboard).catch(() => undefined);
    }
  }, []);

  if (!session) return null;

  if (session.role === "admin") {
    return (
      <section className="section-block">
        <p className="eyebrow">Admin access</p>
        <h1>Admin dashboard</h1>
        <div className="cta-row">
          <a className="primary-cta" href="/admin/sitter-applications">Review sitter applications</a>
          <a className="secondary-cta" href="/admin/forms">Manage dynamic forms</a>
          <button className="secondary-cta" onClick={logout} type="button">Log out</button>
        </div>
      </section>
    );
  }

  if (session.role === "sitter") {
    const profile = sitterDashboard
      ? {
          id: sitterDashboard.profile.id,
          display_name: sitterDashboard.profile.display_name,
          city: sitterDashboard.profile.city,
          address: sitterDashboard.profile.address,
          latitude: sitterDashboard.profile.latitude ?? undefined,
          longitude: sitterDashboard.profile.longitude ?? undefined,
          bio: sitterDashboard.profile.bio,
          service_types: Object.keys(sitterDashboard.profile.service_details ?? {}),
          publication_status: sitterDashboard.profile.publication_status,
          availability_by_service: sitterDashboard.profile.availability_by_service,
          service_details: sitterDashboard.profile.service_details
        }
      : null;
    return (
      <section className="section-block account-grid">
        <div className="story-card">
          <p className="eyebrow">Sitter dashboard</p>
          <h1>{session.full_name}</h1>
          <div className="detail-list">
            <p><strong>Pending requests:</strong> {sitterDashboard?.stats.pending_requests ?? 0}</p>
            <p><strong>Total requests:</strong> {sitterDashboard?.stats.total_stays ?? 0}</p>
            <p><strong>Estimated earnings:</strong> ₪{sitterDashboard?.stats.estimated_earnings_ils ?? 0}</p>
          </div>
          <div className="cta-row">
            <button className="secondary-cta" onClick={logout} type="button">Log out</button>
          </div>
          <div className="application-list">
            {(sitterDashboard?.incoming_requests ?? []).map((item) => (
              <article key={item.id} className="application-card">
                <div>
                  <strong>Request #{item.id}</strong>
                  <p>{item.service_type} · {item.status}</p>
                  <p>{item.message || "No message"}</p>
                </div>
                <strong>₪{item.estimated_price_ils}</strong>
              </article>
            ))}
          </div>
        </div>
        {profile ? <SitterProfileSetup profile={profile} session={session} /> : null}
      </section>
    );
  }

  return (
    <section className="section-block account-grid">
      <div className="story-card">
        <p className="eyebrow">Customer account</p>
        <h1>{session.full_name}</h1>
        <div className="detail-list">
          <p><strong>Bookings:</strong> {ownerDashboard.bookings.length}</p>
          <p><strong>Pets:</strong> {ownerDashboard.pets.length}</p>
        </div>
        <div className="cta-row">
          <button className="secondary-cta" onClick={logout} type="button">Log out</button>
        </div>
        <div className="story-card">
          <h2>Booking history</h2>
          <div className="application-list">
            {ownerDashboard.bookings.map((booking) => (
              <article key={booking.id} className="application-card">
                <div>
                  <strong>{booking.sitter_name}</strong>
                  <p>{booking.service_type} · {booking.status}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="story-card">
          <h2>Dog reviews</h2>
          <div className="detail-list">
            {ownerDashboard.pet_reviews.map((review) => (
              <p key={review.pet_name}><strong>{review.pet_name}:</strong> {review.summary}</p>
            ))}
          </div>
        </div>
      </div>
      <OwnerPetsPanel ownerUserId={session.user_id} ownerDashboard={ownerDashboard} onSaved={setOwnerDashboard} />
    </section>
  );
}

function OwnerPetsPanel({
  ownerUserId,
  ownerDashboard,
  onSaved
}: {
  ownerUserId: number;
  ownerDashboard: OwnerDashboard;
  onSaved: Dispatch<SetStateAction<OwnerDashboard>>;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      const photoFile = formData.get("photo") instanceof File ? (formData.get("photo") as File) : null;
      const uploadedPhoto = photoFile && photoFile.size > 0 ? await uploadImage(photoFile) : null;
      const pet = await saveOwnerPet(ownerUserId, {
        name: String(formData.get("name") ?? ""),
        photo_url: uploadedPhoto?.url,
        breed: String(formData.get("breed") ?? ""),
        weight_kg: String(formData.get("weightKg") ?? ""),
        training_level: String(formData.get("trainingLevel") ?? ""),
        care_notes: String(formData.get("careNotes") ?? "")
      });
      onSaved((current) => ({ ...current, pets: [pet, ...current.pets.filter((item) => item.id !== pet.id)] }));
      setStatus(`Saved ${pet.name}.`);
      setIsModalOpen(false);
      event.currentTarget.reset();
    } catch {
      setStatus("Could not save the pet.");
    }
  }

  return (
    <>
      <div className="story-card pet-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Pets</p>
            <h2>Your dogs</h2>
          </div>
          <button className="secondary-cta" onClick={() => setIsModalOpen(true)} type="button">
            Add pet
          </button>
        </div>
        {ownerDashboard.pets.length ? (
          <div className="pet-choice-grid">
            {ownerDashboard.pets.map((pet) => (
              <article key={pet.id} className="pet-choice-card static">
                {normalizeAssetUrl(pet.photo_url) ? <div className="pet-choice-photo" style={{ backgroundImage: `url(${normalizeAssetUrl(pet.photo_url)})` }} /> : <div className="pet-choice-photo placeholder">🐶</div>}
                <strong>{pet.name}</strong>
                <span>{pet.breed || "Breed not set"}</span>
                <span>{pet.training_level || "Training level not set"}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="story-card compact-card">
            <p className="status-copy">No pets saved yet.</p>
          </div>
        )}
        {status ? <p className="status-copy">{status}</p> : null}
      </div>

      <SiteModal
        actions={
          <button className="secondary-cta" onClick={() => setIsModalOpen(false)} type="button">
            Close
          </button>
        }
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pet profile"
      >
        <form className="dynamic-filter-stack" onSubmit={(event) => void handleSubmit(event)}>
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
          <button className="primary-cta" type="submit">Save pet</button>
        </form>
      </SiteModal>
    </>
  );
}

function logout() {
  clearAccountSession();
  window.location.href = "/";
}
