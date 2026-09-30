import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const maisonNeue = localFont({
  src: [
    { path: "./fonts/maison-neue/MaisonNeue-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/maison-neue/MaisonNeue-Book.ttf", weight: "400", style: "normal" },
    { path: "./fonts/maison-neue/MaisonNeue-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-maison",
});

export const metadata: Metadata = {
  title: "Bob van Boekel",
  description: "Portfolio of Bob van Boekel",
  // The "B" of the logo (Maison Neue Bold), dark on a light browser and light on
  // a dark one. The first entry is the fallback where `media` is ignored.
  icons: {
    icon: [
      { url: "/icons/favicon-light.png", type: "image/png" },
      { url: "/icons/favicon-light.png", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "/icons/favicon-dark.png", type: "image/png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/icons/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={maisonNeue.variable}>
      <body>{children}</body>
    </html>
  );
}
