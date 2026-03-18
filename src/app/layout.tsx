import type { Metadata } from "next";
import { Dancing_Script, Lato, Playfair_Display } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const lato = Lato({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Handcrafted Haven",
    template: "%s | Handcrafted Haven",
  },
  description:
    "Marketplace for artisans and makers to showcase and sell unique handcrafted products.",
  keywords: [
    "handmade marketplace",
    "handcrafted products",
    "local artisans",
    "sustainable shopping",
    "handcrafted haven",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dancingScript.variable} ${lato.variable}`}
    >
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" className="container page-shell">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
