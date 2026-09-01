import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Star Haven Strength | Coming Soon",
  description:
    "Train like a Star, Feel like a Star. Star Haven Strength — online personal training. Coming soon.",
  openGraph: {
    title: "Star Haven Strength | Coming Soon",
    description: "Train like a Star, Feel like a Star. Coming soon.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
