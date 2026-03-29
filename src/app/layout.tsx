import type { Metadata } from "next";
import { Dancing_Script, Lato, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSupabaseServerClient } from "@/lib/supabase/server";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authUser = user
    ? {
        name:
          user.user_metadata?.full_name ??
          user.email?.split("@")[0] ??
          "Usuário",
        email: user.email ?? "",
      }
    : null;

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dancingScript.variable} ${lato.variable}`}
    >
      <body>
        <CartProvider>
          <a className="skip-link" href="#main-content">
            Skip to main content
          </a>
          <SiteHeader user={authUser} />
          <main id="main-content" className="container page-shell">
            {children}
          </main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
