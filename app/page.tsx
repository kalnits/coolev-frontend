import Link from "next/link";

import { Header } from "../components/header";

const trustPoints = [
  "Browse trusted local sitters and walkers before signing in.",
  "Request dog care only when you are ready to book.",
  "Built for Israel with a warmer, calmer marketplace experience."
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
              Become a sitter / walker
            </Link>
            <Link className="secondary-cta" href="/find">
              Find a sitter / walker
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
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
