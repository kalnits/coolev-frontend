import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoolEv Dog Care",
  description: "Trusted dog care across Israel."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
