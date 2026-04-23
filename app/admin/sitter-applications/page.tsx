import { AdminSitterApplications } from "../../../components/admin-sitter-applications";
import { Header } from "../../../components/header";
import { fetchAdminSitterApplications } from "../../../lib/api";

export default async function AdminSitterApplicationsPage() {
  const applications = await fetchAdminSitterApplications().catch(() => []);

  return (
    <main className="page-shell">
      <Header />
      <section className="section-block">
        <p className="eyebrow">Admin approvals</p>
        <h1>Review sitter applications</h1>
        <p>Pending sitters will not appear in search until an admin approves them.</p>
      </section>
      <section className="section-block">
        <AdminSitterApplications applications={applications} />
      </section>
    </main>
  );
}
