import { Header } from "../../components/header";
import { SearchIntakeForm } from "../../components/search-intake-form";
import { fetchSearchFilters } from "../../lib/api";

export default async function FindPage() {
  const filters = await fetchSearchFilters().catch(() => []);

  return (
    <main className="page-shell">
      <Header />
      <section className="section-block">
        <p className="eyebrow">Find dog care</p>
        <h1>Find a sitter / walker</h1>
        <SearchIntakeForm extraFilters={filters} />
      </section>
    </main>
  );
}
