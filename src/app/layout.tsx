import type { Metadata } from "next";
import type { ReactNode } from "react";
import CartProvider from "@/components/cart-provider";
import { Cormorant_Garamond, Manrope, DM_Mono } from "next/font/google";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const monoFont = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AURELIS — Beyond Ordinary, Within Reach.",
    template: "%s | AURELIS",
  },
  description:
    "Discover a considered collection of fashion, technology, home, beauty and everyday essentials. AURELIS — Beyond Ordinary, Within Reach.",
  applicationName: "AURELIS",
  keywords: [
    "AURELIS",
    "online shopping Bangladesh",
    "fashion",
    "electronics",
    "home and living",
    "beauty",
    "lifestyle",
  ],
  openGraph: {
    title: "AURELIS — Beyond Ordinary, Within Reach.",
    description: "Discover a world of considered essentials.",
    siteName: "AURELIS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
