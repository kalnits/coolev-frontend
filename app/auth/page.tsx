import { AuthClient } from "../../components/auth-client";
import { Header } from "../../components/header";

type AuthPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const query = await searchParams;
  const next = typeof query.next === "string" ? query.next : undefined;

  return (
    <main className="page-shell">
      <Header />
      <section className="section-block section-split">
        <div>
          <p className="eyebrow">Account access</p>
          <h1>Login or create an account</h1>
          <p>
            Customers need an account to book sitters. Sitters and admins can also log in here to access their dashboards.
          </p>
        </div>
        <AuthClient next={next} />
      </section>
    </main>
  );
}

