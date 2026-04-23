import { AccountClient } from "../../components/account-client";
import { Header } from "../../components/header";

export default function AccountPage() {
  return (
    <main className="page-shell">
      <Header />
      <AccountClient />
    </main>
  );
}
