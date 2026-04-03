"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";

type AuthUser = { name: string; email: string; role: "buyer" | "seller" } | null;

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/sellers", label: "Sellers" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about", label: "About Us" },
];

export function SiteHeader({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { itemsCount } = useCart();
  const navLinks =
    user?.role === "seller" ? [...links, { href: "/seller", label: "Seller Area" }] : links;

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            ✦
          </span>
          <span>Handcrafted Haven</span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((state) => !state)}
        >
          Menu
        </button>

        <nav
          id="primary-navigation"
          className={`site-nav ${open ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-icons" aria-label="Quick actions">
          {user?.role !== "seller" ? (
            <Link className="icon-chip" href="/cart" aria-label="Cart">
              🛒
              {itemsCount > 0 ? (
                <span className="cart-count-badge" aria-label={`${itemsCount} item(s) in cart`}>
                  {itemsCount}
                </span>
              ) : null}
            </Link>
          ) : null}
          {user ? (
            <Link
              className="icon-chip icon-chip--avatar"
              href="/profile"
              aria-label={`Perfil de ${user.name}`}
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </Link>
          ) : (
            <Link className="icon-chip" href="/login" aria-label="Entrar">
              👤
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
