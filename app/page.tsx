import Link from "next/link";

import { Header } from "../components/header";
import { Icon, type IconName } from "../components/ui/icons";

const trustPoints: { icon: IconName; text: string }[] = [
  { icon: "search", text: "Browse trusted local sitters and walkers before signing in." },
  { icon: "calendar", text: "Request dog care only when you are ready to book." },
  { icon: "heart", text: "Built for Israel with a warmer, calmer marketplace experience." }
];

const features: { icon: IconName; title: string; description: string }[] = [
  { icon: "home", title: "Boarding", description: "Overnight stays in a sitter's home with daily updates and photos." },
  { icon: "footprints", title: "Walking", description: "Daily walks and exercise with local professionals." },
  { icon: "shield", title: "Trust", description: "All sitters are vetted and reviewed by real dog owners." },
  { icon: "star", title: "Quality", description: "Premium experience from search to booking to care." }
];

export default function HomePage() {
  return (
    <main className="home-shell">
      <Header />
      <section className="home-hero">
        <div className="home-copy">
          <p className="eyebrow">Trusted dog care in Israel</p>
          <h1>Airbnb-style dog care, built around trust.</h1>
          <p className="hero-copy">
            We connect dog owners with reliable local sitters and walkers for daily
            care, travel help, and calmer booking experiences.
          </p>
          <div className="cta-row">
            <Link className="primary-cta" href="/become-a-sitter">
              <Icon name="paw" size={18} />
              Become a sitter
            </Link>
            <Link className="secondary-cta" href="/find">
              <Icon name="search" size={18} />
              Find a sitter
            </Link>
          </div>
        </div>
        <div className="story-card">
          <h2>Who we are</h2>
          <p>
            CoolEv is building a dog-first marketplace for Israel, designed to feel
            premium, easy, and trustworthy from the first search to the first walk.
          </p>
          <ul className="trust-list">
            {trustPoints.map((point) => (
              <li key={point.text}>
                <span className="trust-icon">
                  <Icon name={point.icon} size={16} />
                </span>
                {point.text}
              </li>
            ))}
          </ul>
        </div>
      </section>
      
      <section className="section-block">
        <p className="eyebrow">Our services</p>
        <h2>Everything your dog needs</h2>
        <div className="profile-highlight-grid" style={{ marginTop: "var(--space-6)" }}>
          {features.map((feature) => (
            <article key={feature.title} className="profile-highlight-card">
              <span className="picker-icon">
                <Icon name={feature.icon} size={20} />
              </span>
              <strong>{feature.title}</strong>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
