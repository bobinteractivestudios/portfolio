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
