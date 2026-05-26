import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AFC Kravitt — Pasión. Garra. Identidad.",
    template: "%s · AFC Kravitt",
  },
  description:
    "Club de fútbol amateur AFC Kravitt. Estadísticas, plantel, partidos y comunidad. Construyendo identidad deportiva desde 2026.",
  keywords: [
    "AFC Kravitt",
    "Kravitt",
    "fútbol amateur",
    "club deportivo",
    "estadísticas",
    "plantel",
  ],
  authors: [{ name: "AFC Kravitt" }],
  icons: {
    icon: [
      { url: "/favicon-kravitt.ico", type: "image/x-icon" },
      { url: "/logo/escudo-kravitt.png", type: "image/png" },
    ],
    shortcut: "/favicon-kravitt.ico",
    apple: "/logo/escudo-kravitt.png",
  },
  openGraph: {
    title: "AFC Kravitt",
    description:
      "Pasión. Garra. Identidad. La plataforma oficial del club AFC Kravitt.",
    type: "website",
    locale: "es_MX",
    siteName: "AFC Kravitt",
  },
  twitter: {
    card: "summary_large_image",
    title: "AFC Kravitt",
    description: "Pasión. Garra. Identidad.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${anton.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-kravitt-night text-kravitt-cream">
        {children}
      </body>
    </html>
  );
}
