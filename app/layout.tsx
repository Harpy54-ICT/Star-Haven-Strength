import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.starhavenstrength.com"),
  title: {
    default: "Star Haven Strength | Online Personal Training",
    template: "%s | Star Haven Strength",
  },
  description:
    "Train like a Star, Feel like a Star. Star Haven Strength is veteran-owned online personal training for youth, adults, and the military community.",
  openGraph: {
    title: "Star Haven Strength | Online Personal Training",
    description:
      "Train like a Star, Feel like a Star. Veteran-owned online personal training.",
    type: "website",
    siteName: "Star Haven Strength",
    url: "https://www.starhavenstrength.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
