import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOVAREING - Graduation Celebration",
  description:
    "Experience an unforgettable graduation celebration. Browse graduating student profiles, share memories, and celebrate this momentous milestone together.",
  metadataBase: new URL("https://example.com"),
  themeColor: "#0a0a0a",
  viewport: {
    width: "device-width",
    initialScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-netflix-dark">
      <head>
        {/* Load fonts from a CDN with better reliability */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Playfair+Display:wght@400;600;700;800;900&family=Lora:wght@400;600;700&family=Cormorant+Garamond:wght@400;600;700&family=Poppins:wght@400;600;700&family=Montserrat:wght@400;600;700&family=Lavishly+Yours&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased bg-netflix-dark text-white"
        style={{
          fontFamily:
            "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
