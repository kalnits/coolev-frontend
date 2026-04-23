import { Header } from "../../components/header";
import { BecomeASitterClient } from "../../components/become-a-sitter-client";

export default function BecomeASitterPage() {
  return (
    <main className="page-shell">
      <Header />
      <section className="section-block section-split">
        <div>
          <p className="eyebrow">Join the marketplace</p>
          <h1>Become a sitter / walker</h1>
          <p>
            Create your account and your first sitter profile in one flow. Once admin
            approves your listing, it becomes visible in search and you can start receiving requests.
          </p>
        </div>
        <BecomeASitterClient />
      </section>
    </main>
  );
}
