import Link from "next/link";
import { ArrowUpRight, Camera, Users, Mail } from "lucide-react";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Shop all", href: "/shop" },
      { label: "Collections", href: "/collections" },
      { label: "Our story", href: "/about" },
    ],
  },
  {
    title: "Assistance",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Track an order", href: "/track-order" },
      { label: "Delivery information", href: "/shipping" },
      { label: "Returns & refunds", href: "/returns" },
    ],
  },
  {
    title: "Information",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms & conditions", href: "/terms" },
    ],
  },
];

export default function StorefrontFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#250711] text-[#f1e8d8]">
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-[#64152f]/20 blur-[100px]" />

      <div className="container-main relative py-16 sm:py-20 lg:py-24">
        <div className="grid gap-14 border-b border-white/15 pb-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-block font-serif text-4xl tracking-[0.17em] transition-opacity hover:opacity-75"
            >
              AURELIS
            </Link>

            <p className="mt-3 font-mono text-[9px] tracking-[0.2em] text-[#d2bea5]">
              BEYOND ORDINARY, WITHIN REACH.
            </p>

            <p className="mt-7 max-w-xs text-sm leading-7 text-[#c9b9aa]">
              A world of considered choices. Discover pieces that bring
              character to your style, your space, and your everyday.
            </p>

            <div className="mt-7 flex items-center gap-4">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all duration-300 hover:border-[#d2bea5] hover:bg-[#d2bea5] hover:text-[#250711]"
              >
                <Camera size={16} strokeWidth={1.5} />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all duration-300 hover:border-[#d2bea5] hover:bg-[#d2bea5] hover:text-[#250711]"
              >
                <Users size={16} strokeWidth={1.5} />
              </a>

              <a
                href="mailto:hello@aurelis.com"
                aria-label="Email AURELIS"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all duration-300 hover:border-[#d2bea5] hover:bg-[#d2bea5] hover:text-[#250711]"
              >
                <Mail size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-6 font-mono text-[10px] tracking-[0.17em] text-[#d2bea5] uppercase">
                {group.title}
              </h3>

              <div className="flex flex-col items-start gap-4">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-[#e3d9cc]/80 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-between gap-5 pt-8 text-[9px] tracking-[0.12em] text-[#b9a58a] sm:flex-row sm:items-center">
          <p>© 2026 AURELIS. ALL RIGHTS RESERVED.</p>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              PRIVACY
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              TERMS
            </Link>
            <span className="text-[#d2bea5]">
              BEYOND ORDINARY, WITHIN REACH.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
