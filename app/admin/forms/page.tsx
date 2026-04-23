import { AdminSchemaManager } from "../../../components/admin-schema-manager";
import { Header } from "../../../components/header";
import { fetchAdminForms } from "../../../lib/api";

export default async function AdminFormsPage() {
  const forms = await fetchAdminForms().catch(() => []);

  return (
    <main className="page-shell">
      <Header />
      <section className="section-block">
        <p className="eyebrow">Admin schema builder</p>
        <h1>Manage dynamic forms</h1>
        <p>Create fields, reorder sections, and control public/filterable behavior.</p>
      </section>
      <section className="section-block">
        <AdminSchemaManager forms={forms} />
      </section>
    </main>
  );
}
