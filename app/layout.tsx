import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  Lora,
  Cormorant_Garamond,
  Poppins,
  Montserrat,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Lavishly_Yours } from "next/font/google";

const _geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const _playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});
const _lora = Lora({ subsets: ["latin"], variable: "--font-serif" });
const _cormorant = Cormorant_Garamond({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-elegant",
});
const _poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-modern",
});
const _montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
});
const _lavishly = Lavishly_Yours({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-lavishly",
});
export const metadata: Metadata = {
  title: "Graduation Celebration - Class of 2024",
  description:
    "Experience an unforgettable graduation celebration. Browse graduating student profiles, share memories, and celebrate this momentous milestone together.",
  generator: "v0.app",
  themeColor: "#0a0a0a",
  viewport: {
    width: "device-width",
    initialScale: 1,
    userScalable: false,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-netflix-dark">
      <body
        className={`${_geist.variable} ${_playfairDisplay.variable} ${_lora.variable} ${_cormorant.variable} ${_poppins.variable} ${_montserrat.variable} ${_lavishly.variable} font-sans antialiased bg-netflix-dark text-white`}
      >
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
