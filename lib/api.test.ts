import { afterEach, describe, expect, it, vi } from "vitest";

import { buildApiUrl, fetchSitters, updateSitterProfile, uploadImage } from "./api";

describe("buildApiUrl", () => {
  it("builds backend API URLs from the configured base", () => {
    expect(buildApiUrl("/sitters")).toBe("http://localhost:8000/api/sitters");
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchSitters", () => {
  it("includes extra admin-driven filters in the query string", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] })
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchSitters({
      city: "Tel Aviv",
      serviceType: "boarding",
      extraFilters: {
        house_type: "apartment",
        has_other_pets: "true"
      }
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("house_type=apartment");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("has_other_pets=true");
  });

  it("includes result popup filters in the query string", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] })
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchSitters({
      city: "Tel Aviv",
      serviceType: "walking",
      minPriceIls: "80",
      maxPriceIls: "100",
      maxDistanceKm: "5"
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("min_price_ils=80");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("max_price_ils=100");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("max_distance_km=5");
  });
});

describe("updateSitterProfile", () => {
  it("sends service details to the sitter profile update endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, bio: "Updated", publication_status: "pending_approval" })
    });
    vi.stubGlobal("fetch", fetchMock);

    await updateSitterProfile(1, {
      bio: "Updated",
      boarding_details: {
        price_ils: 120,
        accepted_dog_sizes: ["s", "m"],
        availability_notes: "Home-based boarding",
        advance_notice_hours: 24,
        pickup_available: true,
        pickup_price_ils: 35,
        accepts_untrained_dogs: false,
        accepts_unneutered_dogs: false,
        accepts_puppies: true
      }
    });

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/auth/sitters/1/profile");
    expect(String(fetchMock.mock.calls[0]?.[1]?.method)).toBe("PUT");
  });
});

describe("uploadImage", () => {
  it("posts multipart data to the uploads endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: "http://localhost:8000/uploads/example.jpg" })
    });
    vi.stubGlobal("fetch", fetchMock);

    await uploadImage(new File(["abc"], "pet.jpg", { type: "image/jpeg" }));

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/uploads/images");
    expect(String(fetchMock.mock.calls[0]?.[1]?.method)).toBe("POST");
  });
});
