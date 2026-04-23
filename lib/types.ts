export type SitterSummary = {
  id: number;
  displayName: string;
  city: string;
  addressLabel: string;
  priceLabel: string;
  ratingLabel: string;
  reviewCountLabel: string;
  description: string;
  photoUrl: string;
  badges?: string[];
};

export type ApiSitterSummary = {
  id: number;
  display_name: string;
  city: string;
  distance_km?: number | null;
  service_type: string;
  publication_status: string;
  photo_url: string;
  address_label: string;
  price_label: string;
  rating_label: string;
  review_count: number;
  short_description: string;
  badges: string[];
};

export type ApiSitterProfile = {
  id: number;
  display_name: string;
  city: string;
  address_label?: string;
  bio: string;
  publication_status: string;
  services: string[];
  starting_price_ils: number;
  photo_urls?: string[];
  availability_by_service?: Record<string, AvailabilityRange[]>;
  sections?: Array<{ title: string; items: Array<{ label: string; value: string }> }>;
  reviews?: Array<{ author_name: string; rating: number; comment: string }>;
};

export type ServiceDetailsPayload = {
  price_ils: number;
  accepted_dog_sizes: string[];
  availability_notes: string;
  advance_notice_hours?: number;
  pickup_available: boolean;
  pickup_price_ils?: number;
  accepts_untrained_dogs: boolean;
  accepts_unneutered_dogs: boolean;
  accepts_puppies: boolean;
  house_type?: string;
  has_kids_at_home?: boolean;
  has_other_pets?: boolean;
  min_stay_days?: number;
  max_stay_days?: number;
  accepts_multiple_families?: boolean;
  walk_duration_minutes?: number;
  group_walks?: boolean;
};

export type AvailabilityRange = {
  starts_at: string;
  ends_at: string;
};

export type AccountSession = {
  user_id: number;
  sitter_profile_id: number | null;
  email: string;
  role: string;
  full_name: string;
};

export type RegisterSitterResponse = {
  user: {
    id: number;
    email: string;
    role: string;
    full_name: string;
  };
  profile: {
    id: number;
    display_name: string;
    city: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    bio: string;
    service_types: string[];
    publication_status: string;
    availability_by_service?: Record<string, AvailabilityRange[]>;
    service_details?: Record<string, ServiceDetailsPayload | null>;
  };
  session: AccountSession;
};

export type RegisterOwnerResponse = {
  id: number;
  email: string;
  role: string;
  full_name: string;
  session: AccountSession;
};

export type LoginResponse = {
  session: AccountSession;
};

export type SitterDashboard = {
  profile: {
    id: number;
    display_name: string;
    publication_status: string;
    bio: string;
    city: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
    availability_by_service?: Record<string, AvailabilityRange[]>;
    service_details?: Record<string, ServiceDetailsPayload | null>;
  };
  incoming_requests: Array<{
    id: number;
    service_type: string;
    status: string;
    message?: string;
    starts_at?: string | null;
    ends_at?: string | null;
    estimated_price_ils: number;
  }>;
  stats: {
    pending_requests: number;
    total_stays: number;
    estimated_earnings_ils: number;
  };
};

export type OwnerPet = {
  id: number;
  name: string;
  photo_url?: string;
  breed?: string;
  weight_kg?: string;
  training_level?: string;
  care_notes?: string;
};

export type OwnerDashboard = {
  pets: OwnerPet[];
  bookings: Array<{
    id: number;
    service_type: string;
    status: string;
    message?: string;
    sitter_name: string;
    starts_at?: string | null;
    ends_at?: string | null;
  }>;
  pet_reviews: Array<{
    pet_name: string;
    summary: string;
  }>;
};

export type BookingRequestResponse = {
  id: number;
  owner_user_id: number;
  sitter_profile_id: number;
  service_type: string;
  starts_at?: string | null;
  ends_at?: string | null;
  message: string;
  status: string;
  pet_name?: string | null;
};

export type SearchFilterField = {
  field_key: string;
  label: string;
  field_type: string;
  options: Array<{ value: string; label: string }>;
};

export type SearchFilterValues = Record<string, string | string[]>;

export type SearchResultsFilterState = {
  minPriceIls?: string;
  maxPriceIls?: string;
  maxDistanceKm?: string;
  houseType?: string;
};

export type AdminFormSummary = {
  key: string;
  title: string;
  sections: Array<{
    title: string;
    fields: Array<{
      field_key: string;
      label: string;
      field_type: string;
      is_public: boolean;
      is_filterable: boolean;
    }>;
  }>;
};

export type AdminSitterApplication = {
  id: number;
  display_name: string;
  publication_status: string;
};
