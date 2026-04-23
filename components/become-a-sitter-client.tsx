"use client";

import { useEffect, useState } from "react";

import { readAccountSession, readSitterProfile } from "../lib/account-session";
import type { AccountSession, RegisterSitterResponse } from "../lib/types";
import { SitterOnboardingForm } from "./sitter-onboarding-form";
import { SitterProfileSetup } from "./sitter-profile-setup";

const emptyProfile = {
  id: 0,
  display_name: "",
  city: "",
  address: "",
  bio: "",
  service_types: [] as string[],
  publication_status: "pending_approval",
  availability_by_service: {}
};

export function BecomeASitterClient() {
  const [session, setSession] = useState<AccountSession | null>(null);
  const [profile, setProfile] = useState<RegisterSitterResponse["profile"]>(emptyProfile);

  useEffect(() => {
    const storedSession = readAccountSession();
    const storedProfile = readSitterProfile();
    if (storedSession?.role === "sitter") {
      setSession(storedSession);
    }
    if (storedProfile) {
      setProfile(storedProfile);
    }
  }, []);

  return session ? (
    <SitterProfileSetup
      profile={
        profile.id
          ? profile
          : {
              ...emptyProfile,
              id: session.sitter_profile_id ?? 0,
              display_name: session.full_name,
              bio: "",
              city: "",
              service_types: ["boarding", "walking"]
            }
      }
      session={session}
    />
  ) : (
    <SitterOnboardingForm
      onRegistered={(payload) => {
        setSession(payload.session);
        setProfile(payload.profile);
      }}
    />
  );
}
