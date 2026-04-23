import type {
  AdminFormSummary,
  AdminSitterApplication,
  LoginResponse,
  OwnerDashboard,
  OwnerPet,
  ApiSitterProfile,
  ApiSitterSummary,
  BookingRequestResponse,
  RegisterOwnerResponse,
  RegisterSitterResponse,
  SitterDashboard,
  ServiceDetailsPayload,
  SearchFilterField,
  SearchFilterValues
} from "./types";

const PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
const INTERNAL_API_BASE_URL =
  process.env.API_INTERNAL_BASE_URL ?? PUBLIC_API_BASE_URL;

function getApiBaseUrl(): string {
  return typeof window === "undefined" ? INTERNAL_API_BASE_URL : PUBLIC_API_BASE_URL;
}

export function buildApiUrl(path: string): string {
  return `${getApiBaseUrl()}${path}`;
}

export function normalizeAssetUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/uploads/")) {
    return `${getApiBaseUrl().replace(/\/api$/, "")}${url}`;
  }
  if (url.includes("/uploads/") && (url.includes("localhost:8000") || url.includes("127.0.0.1:8000"))) {
    const uploadPath = url.slice(url.indexOf("/uploads/"));
    return `${getApiBaseUrl().replace(/\/api$/, "")}${uploadPath}`;
  }
  return url;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchSitters(params: {
  city: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  serviceType: string;
  startsAt?: string;
  fromDate?: string;
  toDate?: string;
  dogCount?: string;
  dogSizes?: string[];
  goodWithDogs?: boolean;
  goodWithCats?: boolean;
  goodWithKids?: boolean;
  minPriceIls?: string;
  maxPriceIls?: string;
  maxDistanceKm?: string;
  extraFilters?: SearchFilterValues;
}): Promise<ApiSitterSummary[]> {
  const query = new URLSearchParams({
    city: params.city,
    service_type: params.serviceType
  });
  if (params.address) {
    query.set("address", params.address);
  }
  if (params.latitude) {
    query.set("latitude", params.latitude);
  }
  if (params.longitude) {
    query.set("longitude", params.longitude);
  }
  if (params.startsAt) {
    query.set("starts_at", params.startsAt);
  }
  if (params.fromDate) {
    query.set("from_date", params.fromDate);
  }
  if (params.toDate) {
    query.set("to_date", params.toDate);
  }
  if (params.dogCount) {
    query.set("dog_count", params.dogCount);
  }
  for (const dogSize of params.dogSizes ?? []) {
    query.append("dog_sizes", dogSize);
  }
  if (params.goodWithDogs) {
    query.set("good_with_dogs", "true");
  }
  if (params.goodWithCats) {
    query.set("good_with_cats", "true");
  }
  if (params.goodWithKids) {
    query.set("good_with_kids", "true");
  }
  if (params.minPriceIls) {
    query.set("min_price_ils", params.minPriceIls);
  }
  if (params.maxPriceIls) {
    query.set("max_price_ils", params.maxPriceIls);
  }
  if (params.maxDistanceKm) {
    query.set("max_distance_km", params.maxDistanceKm);
  }
  for (const [key, rawValue] of Object.entries(params.extraFilters ?? {})) {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    for (const value of values) {
      if (value) {
        query.append(key, value);
      }
    }
  }
  const data = await requestJson<{ items: ApiSitterSummary[] }>(`/sitters/search?${query.toString()}`);
  return data.items;
}

export async function fetchSitterProfile(id: string): Promise<ApiSitterProfile> {
  return requestJson<ApiSitterProfile>(`/sitters/${id}`);
}

export async function fetchSearchFilters(): Promise<SearchFilterField[]> {
  const data = await requestJson<{ fields: SearchFilterField[] }>("/sitters/search-filters");
  return data.fields;
}

export async function fetchAdminForms(): Promise<AdminFormSummary[]> {
  const data = await requestJson<{ items: AdminFormSummary[] }>("/admin/forms");
  return data.items;
}

export async function fetchAdminSitterApplications(): Promise<AdminSitterApplication[]> {
  const data = await requestJson<{ items: AdminSitterApplication[] }>("/admin/sitter-applications");
  return data.items;
}

export async function approveAdminSitterApplication(applicationId: number) {
  return requestJson<{ id: number; publication_status: string }>(`/admin/sitter-applications/${applicationId}/approve`, {
    method: "POST"
  });
}

export async function createAdminField(
  formKey: string,
  payload: {
    section_title: string;
    field_key: string;
    label: string;
    field_type: string;
    is_public: boolean;
    is_filterable: boolean;
    options: Array<{ value: string; label: string }>;
  }
) {
  return requestJson(`/admin/forms/${formKey}/fields`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function registerSitter(payload: {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  bio: string;
  service_types: string[];
}): Promise<RegisterSitterResponse> {
  return requestJson<RegisterSitterResponse>("/auth/register-sitter", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function registerOwner(payload: {
  email: string;
  password: string;
  full_name: string;
  phone: string;
}): Promise<RegisterOwnerResponse> {
  return requestJson<RegisterOwnerResponse>("/auth/register-owner", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function login(payload: { email: string; password: string }): Promise<LoginResponse> {
  return requestJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateSitterProfile(
  sitterId: number,
  payload: {
    bio: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    boarding_availability_ranges?: Array<{ starts_at: string; ends_at: string }>;
    walking_availability_ranges?: Array<{ starts_at: string; ends_at: string }>;
    walking_details?: ServiceDetailsPayload;
    boarding_details?: ServiceDetailsPayload;
  }
) {
  return requestJson<{ id: number; bio: string; publication_status: string }>(`/auth/sitters/${sitterId}/profile`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function createBookingRequest(payload: {
  owner_user_id?: number;
  sitter_profile_id: number;
  service_type: string;
  starts_at?: string;
  ends_at?: string;
  message: string;
  owner_email: string;
  owner_full_name: string;
  owner_phone: string;
  pet_name?: string;
  pet_photo_url?: string;
  pet_breed?: string;
  pet_weight_kg?: number;
  pet_training_level?: string;
}): Promise<BookingRequestResponse> {
  return requestJson<BookingRequestResponse>("/booking-requests", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const response = await fetch(buildApiUrl("/uploads/images"), {
    method: "POST",
    headers: {
      "Content-Type": file.type,
      "X-File-Name": file.name
    },
    body: file
  });
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
  return response.json() as Promise<{ url: string }>;
}

export async function fetchSitterDashboard(sitterId: number): Promise<SitterDashboard> {
  return requestJson<SitterDashboard>(`/auth/sitters/${sitterId}/dashboard`);
}

export async function fetchOwnerDashboard(ownerUserId: number): Promise<OwnerDashboard> {
  return requestJson<OwnerDashboard>(`/auth/owners/${ownerUserId}/dashboard`);
}

export async function saveOwnerPet(ownerUserId: number, payload: {
  id?: number;
  name: string;
  photo_url?: string;
  breed?: string;
  weight_kg?: string;
  training_level?: string;
  care_notes?: string;
}): Promise<OwnerPet> {
  return requestJson<OwnerPet>(`/auth/owners/${ownerUserId}/pets`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
