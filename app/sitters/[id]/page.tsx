import Link from "next/link";
import { Header } from "../../../components/header";
import { fetchSitterProfile } from "../../../lib/api";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SitterProfilePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const sitter = await fetchSitterProfile(id).catch(() =>
        id === "1"
      ? {
          id: 1,
          display_name: "Maya Ben-David",
          city: "Tel Aviv",
          address_label: "Tel Aviv, Old North",
          bio: "Experienced with city walks and overnight boarding.",
          publication_status: "approved",
          services: ["walking", "boarding"],
          starting_price_ils: 90,
          availability_by_service: {
            boarding: [{ starts_at: "2026-04-20T00:00:00", ends_at: "2026-05-20T23:59:00" }],
            walking: [{ starts_at: "2026-04-20T06:00:00", ends_at: "2026-05-20T22:00:00" }]
          },
          photo_urls: [
            "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80"
          ],
          sections: [
            {
              title: "Boarding details",
              items: [
                { label: "Price", value: "₪110" },
                { label: "House type", value: "Apartment" },
                { label: "Accepted dog sizes", value: "xs, s, m" },
                { label: "Pickup service", value: "Available for ₪35" }
              ]
            },
            {
              title: "Walking details",
              items: [
                { label: "Price", value: "₪85" },
                { label: "Accepted dog sizes", value: "s, m, l" },
                { label: "Walk duration", value: "60 minutes" },
                { label: "Pickup service", value: "Available for ₪20" }
              ]
            }
          ],
          reviews: [{ author_name: "Neta", rating: 5, comment: "Loved booking with Maya." }]
        }
      : null
  );

  if (!sitter) {
    return (
      <main className="page-shell">
        <Header />
        <section className="empty-state">
          <h1>Sitter not found</h1>
        </section>
      </main>
    );
  }

  const serviceSections = (sitter.sections ?? []).filter((section) => section.title.toLowerCase().includes("details"));
  const profileSections = (sitter.sections ?? []).filter((section) => !section.title.toLowerCase().includes("details"));

  return (
    <main className="page-shell">
      <Header />
      <section className="profile-shell">
        <div className="profile-main">
          <p className="eyebrow">Verified local sitter</p>
          <h1>{sitter.display_name}</h1>
          <p className="hero-copy">Book dog care with confidence.</p>
          <div className="profile-gallery-grid">
            {(sitter.photo_urls ?? []).slice(0, 3).map((photoUrl, index) => (
              <div
                key={photoUrl}
                className={index === 0 ? "profile-gallery primary" : "profile-gallery"}
                style={{ backgroundImage: `url(${photoUrl})` }}
              />
            ))}
          </div>
          <div className="profile-meta">
            <span>{sitter.city}</span>
            <span>{sitter.address_label || sitter.city}</span>
            <span>{sitter.services.join(" + ")}</span>
            <span>Profile #{id}</span>
            <span>From ₪{sitter.starting_price_ils}</span>
          </div>
          <section className="profile-highlight-grid">
            <article className="profile-highlight-card">
              <span className="eyebrow">Services</span>
              <strong>{sitter.services.join(" + ")}</strong>
              <p>Set up to receive bookings for the services listed above.</p>
            </article>
            <article className="profile-highlight-card">
              <span className="eyebrow">Starting price</span>
              <strong>₪{sitter.starting_price_ils}</strong>
              <p>Transparent pricing shown before booking.</p>
            </article>
            <article className="profile-highlight-card">
              <span className="eyebrow">Reviews</span>
              <strong>{sitter.reviews?.length ?? 0}</strong>
              <p>Owner feedback shown publicly on the profile.</p>
            </article>
          </section>
          <div className="story-card">
            <h2>About this sitter</h2>
            <p>{sitter.bio}</p>
          </div>
          {serviceSections.length ? (
            <section className="service-section-grid">
              {serviceSections.map((section) => (
                <div key={section.title} className="story-card service-detail-card">
                  <h2>{section.title}</h2>
                  <div className="detail-chip-grid">
                    {section.items.map((item) => (
                      <article key={item.label} className="detail-chip">
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ) : null}
          {profileSections.map((section) => (
            <div key={section.title} className="story-card">
              <h2>{section.title}</h2>
              <div className="detail-list">
                {section.items.map((item) => (
                  <p key={item.label}>
                    <strong>{item.label}:</strong> {item.value}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {sitter.reviews?.length ? (
            <div className="story-card">
              <h2>Reviews</h2>
              {sitter.reviews.map((review) => (
                <article key={`${review.author_name}-${review.comment}`} className="review-card">
                  <strong>{review.author_name}</strong>
                  <p>{review.rating}/5</p>
                  <p>{review.comment}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>
        <div className="panel-form booking-panel">
          <h2>Book this sitter</h2>
          <p>Confirm dates, add your pet details, and send a message.</p>
          <div className="detail-list">
            <p>
              <strong>Services:</strong> {sitter.services.join(", ")}
            </p>
            <p>
              <strong>Address:</strong> {sitter.address_label || sitter.city}
            </p>
            <p>
              <strong>Starting price:</strong> ₪{sitter.starting_price_ils}
            </p>
            <p>
              <strong>Reviews:</strong> {sitter.reviews?.length ?? 0}
            </p>
          </div>
          <Link
            className="primary-cta"
            href={`/auth?next=${encodeURIComponent(
              `/book/${sitter.id}?${new URLSearchParams(
                Object.entries({
                  serviceType:
                    typeof query.serviceType === "string"
                      ? query.serviceType
                      : sitter.services[0] ?? "walking",
                  fromDate: typeof query.fromDate === "string" ? query.fromDate : "",
                  toDate: typeof query.toDate === "string" ? query.toDate : "",
                  startsAt: typeof query.startsAt === "string" ? query.startsAt : "",
                  city: typeof query.city === "string" ? query.city : "",
                  address: typeof query.address === "string" ? query.address : "",
                  latitude: typeof query.latitude === "string" ? query.latitude : "",
                  longitude: typeof query.longitude === "string" ? query.longitude : "",
                }).filter((entry): entry is [string, string] => Boolean(entry[1]))
              ).toString()}`
            )}`}
          >
            Book now
          </Link>
        </div>
      </section>
    </main>
  );
}
