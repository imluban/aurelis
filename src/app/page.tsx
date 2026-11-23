import StorefrontHeader from "@/components/storefront-header";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const categories = [
  {
    number: "01",
    name: "Fashion & Accessories",
    description: "Personal style, thoughtfully selected.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85",
    href: "/categories/fashion-accessories",
  },
  {
    number: "02",
    name: "Electronics & Gadgets",
    description: "Technology for the way you live.",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1000&q=85",
    href: "/categories/electronics-gadgets",
  },
  {
    number: "03",
    name: "Home & Living",
    description: "Make room for better living.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
    href: "/categories/home-living",
  },
  {
    number: "04",
    name: "Beauty & Personal Care",
    description: "Everyday rituals, elevated.",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1000&q=85",
    href: "/categories/beauty-personal-care",
  },
  {
    number: "05",
    name: "Lifestyle & Everyday Essentials",
    description: "The little things that make a difference.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85",
    href: "/categories/lifestyle-essentials",
  },
];

const featuredItems = [
  {
    name: "The Everyday Edit",
    category: "STYLE / COLLECTION 01",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85",
    label: "CURATED SELECTION",
  },
  {
    name: "Objects of Living",
    category: "HOME / COLLECTION 02",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
    label: "MADE FOR YOUR SPACE",
  },
  {
    name: "Modern Essentials",
    category: "LIFESTYLE / COLLECTION 03",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85",
    label: "THE DAILY EDIT",
  },
];

function SectionLabel({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`font-mono text-[10px] tracking-[0.22em] uppercase ${
        light ? " text-[#d2bea5]" : "text-[#8b6d66]"
      }`}
    >
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#470d20] text-[#f1e8d8]">
      {/* ANNOUNCEMENT BAR */}
      <div className="flex min-h-9 items-center justify-center bg-[#350817] px-4 py-2 text-center text-[9px] tracking-[0.2em] text-[#f1e8d8] uppercase sm:text-[10px]">
        Beyond Ordinary, Within Reach.
        <span className="mx-3 text-[#b9a58a]">✳</span>
        Discover AURELIS
      </div>

      {/* INTERACTIVE HEADER */}
      <StorefrontHeader />

      {/* CINEMATIC HERO */}
      <section className="relative flex min-h-[650px] items-center overflow-hidden bg-[#250711] text-[#f1e8d8] sm:min-h-[720px] lg:min-h-[790px]">
        <div
          className="absolute inset-0 scale-[1.02] bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(35,5,15,.88) 0%, rgba(35,5,15,.63) 45%, rgba(35,5,15,.12) 100%), url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2200&q=90')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#250711]/65 via-transparent to-[#250711]/20" />

        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 py-24 sm:px-10 lg:px-24">
          <div className="max-w-[760px]">
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-[#b9a58a]" />
              <SectionLabel light>THE AURELIS EXPERIENCE</SectionLabel>
            </div>

            <h1 className="font-serif text-[clamp(4rem,9vw,8.8rem)] leading-[0.88] font-normal tracking-[-0.055em]">
              Beyond
              <br />
              the{" "}
              <span className="font-normal italic text-[#d2bea5]">
                ordinary.
              </span>
            </h1>

            <p className="mt-9 max-w-[390px] text-sm leading-7 text-[#e3d9cc] sm:text-base">
              A world of considered choices. Discover pieces that bring
              character to your style, your space, and your everyday.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="/shop"
                className="group inline-flex min-h-[52px] items-center gap-8 bg-[#f1e8d8] px-7 py-4 !text-[#470d20] text-[10px] tracking-[0.18em] uppercase transition-colors hover:bg-[#d2bea5]"
              >
                Explore the collection
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.5}
                  className="!text-[#470d20] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </a>

              <a
                href="/about"
                className="inline-flex items-center gap-3 border-b border-[#b9a58a]/60 pb-2 text-[10px] tracking-[0.16em] text-[#f1e8d8] uppercase transition-colors hover:text-[#d2bea5]"
              >
                Discover our story
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>

        <div className="absolute right-7 bottom-9 hidden items-center gap-4 text-[9px] tracking-[0.2em] text-[#e5d9c9] uppercase lg:flex">
          <span>01</span>
          <span className="h-px w-12 bg-[#b9a58a]/70" />
          <span>Discover a different perspective</span>
        </div>
      </section>

      {/* INTRODUCTION — CREAM */}
      <section className="section-spacing-sm border-b border-[#470d20]/10 bg-[#f1e8d8] text-[#470d20]">
        <div className="container-main grid gap-8 md:grid-cols-[1fr_1.3fr] md:items-end">
          <SectionLabel>A DIFFERENT KIND OF DISCOVERY</SectionLabel>

          <div>
            <h2 className="max-w-[800px] font-serif text-4xl leading-[1.08] tracking-[-0.035em] text-[#470d20] sm:text-5xl lg:text-6xl">
              Not just things you need.
              <span className="italic"> Things worth discovering.</span>
            </h2>

            <p className="mt-6 max-w-[540px] text-sm leading-7 text-[#62534d]">
              From personal style to the spaces you call home, AURELIS brings
              together a carefully considered world of products, ideas, and
              everyday inspiration.
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORIES — WINE */}
      <section className="section-spacing bg-[#470d20] text-[#f1e8d8]">
        <div className="container-main">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <SectionLabel light>EXPLORE OUR WORLD</SectionLabel>
              <h2 className="mt-4 font-serif text-4xl tracking-[-0.035em] text-[#f1e8d8] sm:text-5xl">
                Find your something.
              </h2>
            </div>

            <a
              href="/shop"
              className="group inline-flex items-center gap-3 pb-1 text-[10px] tracking-[0.15em] text-[#f1e8d8] uppercase transition-colors hover:text-[#d2bea5]"
            >
              View everything
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <a
                href={category.href}
                key={category.number}
                className={`group relative block min-h-[340px] overflow-hidden bg-[#350817] ${
                  index === 0 ? "lg:row-span-2 lg:min-h-[700px]" : ""
                }`}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/85 via-[#0a0a0b]/15 to-transparent" />

                <div className="absolute top-5 left-5 font-mono text-[10px] tracking-[0.16em] text-white/80">
                  / {category.number}
                </div>

                <div className="absolute right-5 bottom-6 left-5 flex items-end justify-between gap-4 text-white">
                  <div>
                    <p className="mb-2 text-[9px] tracking-[0.18em] text-white/75 uppercase">
                      {category.description}
                    </p>
                    <h3 className="max-w-[280px] font-serif text-3xl leading-tight sm:text-[34px]">
                      {category.name}
                    </h3>
                  </div>

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/60 transition-all group-hover:border-white group-hover:bg-white group-hover:text-[#470d20]">
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTIONS — CREAM */}
      <section className="section-spacing bg-[#f1e8d8] text-[#470d20]">
        <div className="container-main">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <SectionLabel>SELECTED FOR YOU</SectionLabel>
              <h2 className="mt-4 font-serif text-4xl tracking-[-0.035em] text-[#470d20] sm:text-5xl">
                The considered edit.
              </h2>
            </div>

            <p className="max-w-[300px] text-sm leading-6 text-[#62534d]">
              A changing selection of things we think deserve a closer look.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredItems.map((item) => (
              <a href="/collections" key={item.name} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#d5c8b7]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <span className="absolute top-4 left-4 bg-[#f1e8d8] px-3 py-2 font-mono text-[8px] tracking-[0.13em] text-[#470d20]">
                    {item.label}
                  </span>

                  <span className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f1e8d8] text-[#470d20] transition-transform group-hover:rotate-45">
                    <ArrowUpRight size={17} />
                  </span>
                </div>

                <p className="mt-5 font-mono text-[9px] tracking-[0.16em] text-[#8b6d66]">
                  {item.category}
                </p>

                <h3 className="mt-2 font-serif text-3xl text-[#470d20]">
                  {item.name}
                </h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STORY — WINE */}
      <section className="grid bg-[#350817] text-[#f1e8d8] lg:grid-cols-2">
        <div className="relative min-h-[440px] overflow-hidden lg:min-h-[650px]">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=85"
            alt="An atmospheric retail space"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#350817]/35" />
        </div>

        <div className="flex items-center px-7 py-20 sm:px-14 lg:px-20">
          <div className="max-w-[500px]">
            <SectionLabel light>THE THOUGHT BEHIND AURELIS</SectionLabel>

            <h2 className="mt-7 font-serif text-5xl leading-[1.02] tracking-[-0.04em] sm:text-6xl">
              A little less ordinary.
              <span className="mt-2 block italic text-[#d2bea5]">
                A lot more you.
              </span>
            </h2>

            <p className="mt-7 text-sm leading-7 text-[#e3d9cc]">
              We believe shopping should feel like discovery. AURELIS is built
              around the idea that the right choice is not simply about what
              something does, but how it makes everyday life feel.
            </p>

            <a
              href="/about"
              className="group mt-9 inline-flex items-center gap-5 border-b border-[#b9a58a]/60 pb-3 text-[10px] tracking-[0.17em] text-[#f1e8d8] uppercase transition-colors hover:text-[#d2bea5]"
            >
              More about AURELIS
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>
      </section>

      {/* NEWSLETTER — CREAM */}
      <section className="section-spacing bg-[#f1e8d8] text-[#470d20]">
        <div className="container-main text-center">
          <SectionLabel>LET GOOD THINGS FIND YOU</SectionLabel>

          <h2 className="mx-auto mt-5 max-w-[650px] font-serif text-4xl leading-tight tracking-[-0.04em] text-[#470d20] sm:text-6xl">
            A more considered inbox.
          </h2>

          <p className="mx-auto mt-5 max-w-[420px] text-sm leading-6 text-[#62534d]">
            Be first to discover new arrivals, thoughtful edits, and stories
            from the world of AURELIS.
          </p>

          <div className="mx-auto mt-9 flex max-w-[470px] border-b border-[#470d20]/50">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>

            <input
              id="newsletter-email"
              type="email"
              placeholder="Your email address"
              className="min-w-0 flex-1 bg-transparent px-1 py-4 text-sm text-[#470d20] outline-none placeholder:text-[#8b8178]"
            />

            <button
              type="button"
              aria-label="Subscribe"
              className="flex items-center gap-2 px-3 text-[10px] tracking-[0.15em] text-[#470d20] uppercase transition-colors hover:text-[#8b6d66]"
            >
              Join us <ArrowRight size={16} />
            </button>
          </div>

          <p className="mt-4 text-[9px] tracking-wide text-[#8b8178]">
            A thoughtful note, only when there is something worth sharing.
          </p>
        </div>
      </section>

      {/* FOOTER — WINE */}
      <footer className="bg-[#250711] text-[#f1e8d8]">
        <div className="container-main py-16">
          <div className="grid gap-12 border-b border-white/15 pb-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="font-serif text-4xl tracking-[0.17em]">
                AURELIS
              </Link>

              <p className="mt-3 font-mono text-[9px] tracking-[0.2em] text-[#d2bea5]">
                BEYOND ORDINARY, WITHIN REACH.
              </p>
            </div>

            <div>
              <h3 className="mb-5 font-mono text-[10px] tracking-[0.17em] text-[#d2bea5] uppercase">
                Explore
              </h3>

              <div className="flex flex-col gap-3 text-sm text-[#e3d9cc]">
                <a href="/shop" className="hover:text-white">
                  Shop all
                </a>
                <a href="/collections" className="hover:text-white">
                  Collections
                </a>
                <a href="/about" className="hover:text-white">
                  Our story
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-5 font-mono text-[10px] tracking-[0.17em] text-[#d2bea5] uppercase">
                Assistance
              </h3>

              <div className="flex flex-col gap-3 text-sm text-[#e3d9cc]">
                <a href="/contact" className="hover:text-white">
                  Contact us
                </a>
                <a href="/track-order" className="hover:text-white">
                  Track an order
                </a>
                <a href="/shipping" className="hover:text-white">
                  Delivery information
                </a>
                <a href="/returns" className="hover:text-white">
                  Returns & refunds
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-5 font-mono text-[10px] tracking-[0.17em] text-[#d2bea5] uppercase">
                Follow along
              </h3>

              <div className="flex gap-5 text-[#e3d9cc]">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="text-xs tracking-wider transition-colors hover:text-white"
                >
                  IG
                </a>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="text-xs tracking-wider transition-colors hover:text-white"
                >
                  FB
                </a>
              </div>

              <p className="mt-6 text-sm text-[#c9b9aa]">Made for discovery.</p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 pt-7 text-[9px] tracking-[0.12em] text-[#b9a58a] sm:flex-row">
            <p>© 2026 AURELIS. ALL RIGHTS RESERVED.</p>

            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-white">
                PRIVACY
              </a>
              <a href="/terms" className="hover:text-white">
                TERMS
              </a>
              <span>MADE BY LAXON</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
