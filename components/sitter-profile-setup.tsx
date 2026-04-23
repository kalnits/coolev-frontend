"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { updateSitterProfile } from "../lib/api";
import { clearAccountSession, writeSitterProfile } from "../lib/account-session";
import type { AccountSession, AvailabilityRange, RegisterSitterResponse, ServiceDetailsPayload } from "../lib/types";
import type { IconName } from "./ui/icons";
import { AddressAutocompleteInput } from "./ui/address-autocomplete-input";
import { MultiPickerCards, SinglePickerCards } from "./ui/picker-cards";

type SitterProfileSetupProps = {
  session: AccountSession;
  profile: RegisterSitterResponse["profile"];
};

type PickerOption = { value: string; label: string; note?: string; icon?: IconName };

const dogSizeOptions: PickerOption[] = [
  { value: "xs", label: "Tiny", note: "0-7 kg", icon: "dog" },
  { value: "s", label: "Small", note: "8-15 kg", icon: "dog" },
  { value: "m", label: "Medium", note: "16-30 kg", icon: "dog" },
  { value: "l", label: "Large", note: "31+ kg", icon: "bone" }
];

const houseTypeOptions: PickerOption[] = [
  { value: "apartment", label: "Apartment", note: "Indoor city home", icon: "building" },
  { value: "house", label: "House", note: "More space", icon: "home" }
];

const yesNoOptions: PickerOption[] = [
  { value: "true", label: "Yes", icon: "check" },
  { value: "false", label: "No", icon: "close" }
];

const boardingPolicyOptions: PickerOption[] = [
  { value: "pickup", label: "Pickup", note: "Offer pickup", icon: "car" },
  { value: "untrained", label: "Untrained", note: "Accept untrained", icon: "award" },
  { value: "unneutered", label: "Unneutered", note: "Accept intact dogs", icon: "shield" },
  { value: "puppies", label: "Puppies", note: "Young dogs welcome", icon: "sparkles" },
  { value: "families", label: "Mixed families", note: "Host multiple homes", icon: "users" }
];

const walkingPolicyOptions: PickerOption[] = [
  { value: "pickup", label: "Pickup", note: "Collect the dog", icon: "car" },
  { value: "untrained", label: "Untrained", note: "Accept untrained", icon: "award" },
  { value: "unneutered", label: "Unneutered", note: "Accept intact dogs", icon: "shield" },
  { value: "puppies", label: "Puppies", note: "Young dogs welcome", icon: "sparkles" },
  { value: "group", label: "Group walks", note: "Can walk with others", icon: "footprints" }
];

const weekdayOptions: PickerOption[] = [
  { value: "0", label: "Sun" },
  { value: "1", label: "Mon" },
  { value: "2", label: "Tue" },
  { value: "3", label: "Wed" },
  { value: "4", label: "Thu" },
  { value: "5", label: "Fri" },
  { value: "6", label: "Sat" }
];

const daypartOptions: PickerOption[] = [
  { value: "morning", label: "Morning", note: "06:00-12:00", icon: "clock" },
  { value: "afternoon", label: "Afternoon", note: "12:00-17:00", icon: "clock" },
  { value: "evening", label: "Evening", note: "17:00-22:00", icon: "clock" },
  { value: "night", label: "Night", note: "22:00-06:00", icon: "clock" }
];

export function SitterProfileSetup({ session, profile }: SitterProfileSetupProps) {
  const existingBoarding = profile.service_details?.boarding;
  const existingWalking = profile.service_details?.walking;
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [bio, setBio] = useState(profile.bio);
  const [address, setAddress] = useState(profile.address || profile.city);
  const [city, setCity] = useState(profile.city);
  const [latitude, setLatitude] = useState(profile.latitude ? String(profile.latitude) : "");
  const [longitude, setLongitude] = useState(profile.longitude ? String(profile.longitude) : "");
  const [boardingDays, setBoardingDays] = useState<string[]>(
    inferWeekdays(profile.availability_by_service?.boarding, true)
  );
  const [walkingDays, setWalkingDays] = useState<string[]>(
    inferWeekdays(profile.availability_by_service?.walking, false)
  );
  const [walkingPeriods, setWalkingPeriods] = useState<string[]>(
    inferDayparts(profile.availability_by_service?.walking)
  );

  const [boardingHouseType, setBoardingHouseType] = useState(existingBoarding?.house_type || "apartment");
  const [boardingSizes, setBoardingSizes] = useState<string[]>(existingBoarding?.accepted_dog_sizes || ["xs", "s", "m"]);
  const [boardingKids, setBoardingKids] = useState(existingBoarding?.has_kids_at_home ? "true" : "false");
  const [boardingPets, setBoardingPets] = useState(existingBoarding?.has_other_pets ? "true" : "false");
  const [boardingPolicies, setBoardingPolicies] = useState<string[]>(
    [
      existingBoarding?.pickup_available ? "pickup" : null,
      existingBoarding?.accepts_untrained_dogs ? "untrained" : null,
      existingBoarding?.accepts_unneutered_dogs ? "unneutered" : null,
      existingBoarding?.accepts_puppies ? "puppies" : null,
      existingBoarding?.accepts_multiple_families ? "families" : null
    ].filter(Boolean) as string[]
  );

  const [walkingSizes, setWalkingSizes] = useState<string[]>(existingWalking?.accepted_dog_sizes || ["s", "m", "l"]);
  const [walkingPolicies, setWalkingPolicies] = useState<string[]>(
    [
      existingWalking?.pickup_available ? "pickup" : null,
      existingWalking?.accepts_untrained_dogs ? "untrained" : null,
      existingWalking?.accepts_unneutered_dogs ? "unneutered" : null,
      existingWalking?.accepts_puppies ? "puppies" : null,
      existingWalking?.group_walks ? "group" : null
    ].filter(Boolean) as string[]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const serviceTypes = new Set(profile.service_types);
    const payload = {
      bio: String(formData.get("bio") ?? ""),
      city,
      address,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      boarding_availability_ranges: buildBoardingAvailabilityRanges(boardingDays),
      walking_availability_ranges: buildWalkingAvailabilityRanges(walkingDays, walkingPeriods),
      walking_details: serviceTypes.has("walking") ? buildWalkingDetails(formData, walkingSizes, walkingPolicies) : undefined,
      boarding_details: serviceTypes.has("boarding") ? buildBoardingDetails(formData, boardingHouseType, boardingSizes, boardingKids, boardingPets, boardingPolicies) : undefined
    };
    setIsSaving(true);
    setStatus(null);
    try {
      await updateSitterProfile(session.sitter_profile_id ?? profile.id, payload);
      writeSitterProfile({ ...profile, bio: payload.bio });
      setStatus("Profile saved.");
    } catch {
      setStatus("Could not save the sitter profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="profile-setup-shell">
      {profile.publication_status === "pending_approval" ? (
        <div className="approval-banner">
          <p className="eyebrow">Approval needed</p>
          <h2>Not visible in search yet</h2>
          <div className="detail-list">
            <p><strong>Status:</strong> waiting for approval</p>
            <p><strong>Next:</strong> finish the profile now and it will go live after admin approval.</p>
          </div>
        </div>
      ) : null}

      <div className="story-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Sitter account</p>
            <h2>{session.full_name}</h2>
          </div>
          <button
            className="secondary-cta"
            onClick={() => {
              clearAccountSession();
              window.location.reload();
            }}
            type="button"
          >
            Log out
          </button>
        </div>
        <div className="detail-list">
          <p><strong>Email:</strong> {session.email}</p>
          <p><strong>Services:</strong> {profile.service_types.join(", ")}</p>
          <p><strong>Status:</strong> {profile.publication_status.replaceAll("_", " ")}</p>
          <p><strong>Address:</strong> {address}</p>
        </div>
      </div>

      <form className="panel-form" onSubmit={(event) => void handleSubmit(event)}>
        <label>
          Address
          <AddressAutocompleteInput
            onChange={(value) => {
              setAddress(value.address);
              setCity(value.city);
              setLatitude(value.latitude ? String(value.latitude) : "");
              setLongitude(value.longitude ? String(value.longitude) : "");
            }}
            required
            value={{ address, city, latitude: latitude ? Number(latitude) : undefined, longitude: longitude ? Number(longitude) : undefined }}
          />
        </label>
        <label>
          Description
          <textarea name="bio" onChange={(event) => setBio(event.target.value)} rows={5} value={bio} />
        </label>

        <section className="setup-section">
          <div className="section-head">
            <h3>Availability</h3>
            <span className="status-copy">Only these dates appear in search</span>
          </div>
          {profile.service_types.includes("boarding") ? (
            <label>
              Boarding days
              <MultiPickerCards
                name="boardingWeekdaysPreview"
                onChange={setBoardingDays}
                options={weekdayOptions}
                values={boardingDays}
              />
            </label>
          ) : null}
          {profile.service_types.includes("walking") ? (
            <>
              <label>
                Walking days
                <MultiPickerCards
                  name="walkingWeekdaysPreview"
                  onChange={setWalkingDays}
                  options={weekdayOptions}
                  values={walkingDays}
                />
              </label>
              <label>
                Walking times
                <MultiPickerCards
                  name="walkingPeriodsPreview"
                  onChange={setWalkingPeriods}
                  options={daypartOptions}
                  values={walkingPeriods}
                />
              </label>
            </>
          ) : null}
          <div className="detail-list">
            {profile.service_types.includes("boarding") ? <p><strong>Boarding:</strong> {boardingDays.length ? `${boardingDays.length} day(s) each week` : "Not available"}</p> : null}
            {profile.service_types.includes("walking") ? <p><strong>Walking:</strong> {walkingDays.length && walkingPeriods.length ? `${walkingDays.length} day(s) · ${walkingPeriods.length} time block(s)` : "Not available"}</p> : null}
          </div>
        </section>

        {profile.service_types.includes("boarding") ? (
          <section className="setup-section">
            <div className="section-head">
              <h3>Boarding</h3>
              <span className="status-copy">Home stay details</span>
            </div>
            <div className="search-grid">
              <label>
                Price per stay
                <input defaultValue={existingBoarding?.price_ils ?? "110"} min="0" name="boardingPriceIls" required type="number" />
              </label>
              <label>
                Notice in advance
                <input defaultValue={existingBoarding?.advance_notice_hours ?? "24"} min="0" name="boardingAdvanceNoticeHours" type="number" />
              </label>
            </div>
            <label>
              Home type
              <SinglePickerCards name="boardingHouseType" onChange={setBoardingHouseType} options={houseTypeOptions} value={boardingHouseType} />
            </label>
            <label>
              Dog sizes
              <MultiPickerCards name="boardingAcceptedDogSizes" onChange={setBoardingSizes} options={dogSizeOptions} values={boardingSizes} />
            </label>
            <div className="search-grid">
              <label>
                Kids at home
                <SinglePickerCards name="boardingHasKidsAtHome" onChange={setBoardingKids} options={yesNoOptions} value={boardingKids} />
              </label>
              <label>
                Other pets at home
                <SinglePickerCards name="boardingHasOtherPets" onChange={setBoardingPets} options={yesNoOptions} value={boardingPets} />
              </label>
            </div>
              <label>
                Availability
              <textarea defaultValue={existingBoarding?.availability_notes ?? "Weekday and weekend availability with home-based supervision."} name="boardingAvailabilityNotes" rows={3} />
              </label>
              <div className="search-grid">
                <label>
                  Min days
                <input defaultValue={existingBoarding?.min_stay_days ?? "1"} min="1" name="boardingMinStayDays" type="number" />
                </label>
                <label>
                  Max days
                <input defaultValue={existingBoarding?.max_stay_days ?? "10"} min="1" name="boardingMaxStayDays" type="number" />
                </label>
              </div>
              <div className="search-grid">
                <label>
                  Pickup price
                <input defaultValue={existingBoarding?.pickup_price_ils ?? "35"} min="0" name="boardingPickupPriceIls" type="number" />
                </label>
              </div>
            <label>
              Policies
              <MultiPickerCards name="boardingPoliciesPreview" onChange={setBoardingPolicies} options={boardingPolicyOptions} values={boardingPolicies} />
            </label>
          </section>
        ) : null}

        {profile.service_types.includes("walking") ? (
          <section className="setup-section">
            <div className="section-head">
              <h3>Walking</h3>
              <span className="status-copy">Walk setup</span>
            </div>
            <div className="search-grid">
              <label>
                Price per walk
                <input defaultValue={existingWalking?.price_ils ?? "75"} min="0" name="walkingPriceIls" required type="number" />
              </label>
              <label>
                Walk duration
                <input defaultValue={existingWalking?.walk_duration_minutes ?? "45"} min="15" name="walkingWalkDurationMinutes" type="number" />
              </label>
            </div>
            <label>
              Dog sizes
              <MultiPickerCards name="walkingAcceptedDogSizes" onChange={setWalkingSizes} options={dogSizeOptions} values={walkingSizes} />
            </label>
              <label>
                Availability
              <textarea defaultValue={existingWalking?.availability_notes ?? "Morning and evening walks with optional pickup."} name="walkingAvailabilityNotes" rows={3} />
              </label>
              <div className="search-grid">
                <label>
                  Notice in advance
                <input defaultValue={existingWalking?.advance_notice_hours ?? "6"} min="0" name="walkingAdvanceNoticeHours" type="number" />
                </label>
                <label>
                  Pickup price
                <input defaultValue={existingWalking?.pickup_price_ils ?? "20"} min="0" name="walkingPickupPriceIls" type="number" />
                </label>
              </div>
            <label>
              Policies
              <MultiPickerCards name="walkingPoliciesPreview" onChange={setWalkingPolicies} options={walkingPolicyOptions} values={walkingPolicies} />
            </label>
          </section>
        ) : null}

        <button className="primary-cta" disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : "Save profile"}
        </button>
        {status ? <p className="status-copy">{status}</p> : null}
      </form>
    </div>
  );
}

function inferWeekdays(ranges: AvailabilityRange[] | undefined, treatAsAllDay: boolean) {
  const values = new Set<string>();
  for (const range of ranges ?? []) {
    const date = new Date(range.starts_at);
    const end = new Date(range.ends_at);
    if (treatAsAllDay || end.getHours() !== 23 || end.getMinutes() !== 59 || date.getHours() === 0) {
      values.add(String(date.getDay()));
    }
  }
  return values.size ? Array.from(values).sort() : ["1", "2", "3", "4", "5"];
}

function inferDayparts(ranges: AvailabilityRange[] | undefined) {
  const values = new Set<string>();
  for (const range of ranges ?? []) {
    const start = new Date(range.starts_at);
    const hour = start.getHours();
    if (hour < 12 && hour >= 6) values.add("morning");
    else if (hour < 17) values.add("afternoon");
    else if (hour < 22) values.add("evening");
    else values.add("night");
  }
  return values.size ? Array.from(values) : ["morning", "evening"];
}

function buildBoardingAvailabilityRanges(days: string[]): AvailabilityRange[] {
  return buildRangesForNextWeeks(days, ["all_day"]);
}

function buildWalkingAvailabilityRanges(days: string[], periods: string[]): AvailabilityRange[] {
  return buildRangesForNextWeeks(days, periods);
}

function buildRangesForNextWeeks(days: string[], periods: string[]): AvailabilityRange[] {
  const selectedDays = new Set(days);
  const results: AvailabilityRange[] = [];
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  for (let offset = 0; offset < 84; offset += 1) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + offset);
    if (!selectedDays.has(String(current.getDay()))) continue;
    for (const period of periods) {
      const [startHour, endHour, endMinute, spillToNextDay] = periodWindow(period);
      const startsAt = new Date(current);
      startsAt.setHours(startHour, 0, 0, 0);
      const endsAt = new Date(current);
      if (spillToNextDay) {
        endsAt.setDate(endsAt.getDate() + 1);
      }
      endsAt.setHours(endHour, endMinute, 0, 0);
      results.push({
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString()
      });
    }
  }
  return results;
}

function periodWindow(period: string): [number, number, number, boolean] {
  if (period === "all_day") return [0, 23, 59, false];
  if (period === "morning") return [6, 12, 0, false];
  if (period === "afternoon") return [12, 17, 0, false];
  if (period === "evening") return [17, 22, 0, false];
  return [22, 6, 0, true];
}

function buildBoardingDetails(
  formData: FormData,
  houseType: string,
  sizes: string[],
  kids: string,
  pets: string,
  policies: string[]
): ServiceDetailsPayload {
  return {
    price_ils: Number(formData.get("boardingPriceIls") ?? 0),
    house_type: houseType,
    accepted_dog_sizes: sizes,
    has_kids_at_home: kids === "true",
    has_other_pets: pets === "true",
    availability_notes: String(formData.get("boardingAvailabilityNotes") ?? ""),
    advance_notice_hours: Number(formData.get("boardingAdvanceNoticeHours") ?? 0),
    min_stay_days: Number(formData.get("boardingMinStayDays") ?? 0),
    max_stay_days: Number(formData.get("boardingMaxStayDays") ?? 0),
    pickup_available: policies.includes("pickup"),
    pickup_price_ils: Number(formData.get("boardingPickupPriceIls") ?? 0),
    accepts_untrained_dogs: policies.includes("untrained"),
    accepts_unneutered_dogs: policies.includes("unneutered"),
    accepts_puppies: policies.includes("puppies"),
    accepts_multiple_families: policies.includes("families")
  };
}

function buildWalkingDetails(
  formData: FormData,
  sizes: string[],
  policies: string[]
): ServiceDetailsPayload {
  return {
    price_ils: Number(formData.get("walkingPriceIls") ?? 0),
    accepted_dog_sizes: sizes,
    availability_notes: String(formData.get("walkingAvailabilityNotes") ?? ""),
    advance_notice_hours: Number(formData.get("walkingAdvanceNoticeHours") ?? 0),
    walk_duration_minutes: Number(formData.get("walkingWalkDurationMinutes") ?? 0),
    pickup_available: policies.includes("pickup"),
    pickup_price_ils: Number(formData.get("walkingPickupPriceIls") ?? 0),
    accepts_untrained_dogs: policies.includes("untrained"),
    accepts_unneutered_dogs: policies.includes("unneutered"),
    accepts_puppies: policies.includes("puppies"),
    group_walks: policies.includes("group")
  };
}
