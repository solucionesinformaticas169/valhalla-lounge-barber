import type { Metadata } from "next";
import { Cinzel, Manrope } from "next/font/google";

import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel"
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://valhalla-lounge-barber.vercel.app"),
  title: "Valhalla Lounge Barber | Barberia Premium en Cuenca",
  description:
    "Home premium para Valhalla Lounge Barber con reservas online, diseño vikingo elegante y estructura lista para SaaS.",
  keywords: [
    "barberia",
    "barberia premium",
    "barberia en Cuenca",
    "reservas online",
    "Valhalla Lounge Barber"
  ],
  openGraph: {
    title: "Valhalla Lounge Barber",
    description: "Barberia premium con reservas online y estilo vikingo moderno.",
    images: ["/images/valhalla-home-reference.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${cinzel.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
