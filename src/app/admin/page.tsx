"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Package,
  ShoppingBag,
  Layers3,
  Image,
  LogOut,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AdminStats = {
  products: number;
  categories: number;
  orders: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    products: 0,
    categories: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data: admin } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!admin) {
        await supabase.auth.signOut();
        router.replace("/admin/login?error=unauthorized");
        return;
      }

      const [products, categories, orders] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase
          .from("categories")
          .select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
      ]);

      if (!active) return;

      setAdminEmail(user.email ?? "Administrator");
      setStats({
        products: products.count ?? 0,
        categories: categories.count ?? 0,
        orders: orders.count ?? 0,
      });
      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSignOut() {
    setSigningOut(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
  }

  const statCards = [
    {
      label: "Total products",
      value: stats.products,
      icon: Package,
      note: "Published and unpublished",
    },
    {
      label: "Categories",
      value: stats.categories,
      icon: Layers3,
      note: "Store collection groups",
    },
    {
      label: "Total orders",
      value: stats.orders,
      icon: ShoppingBag,
      note: "Customer orders",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f4ed] text-[#350817]">
      <header className="border-b border-[#470d20]/10 bg-[#350817] text-[#f1e8d8]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/admin" className="font-serif text-3xl tracking-[0.15em]">
            AURELIS
          </Link>

          <div className="flex items-center gap-5">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-2 text-xs text-[#f1e8d8]/70 transition-colors hover:text-[#d2bea5] sm:flex"
            >
              View storefront <ExternalLink size={13} />
            </Link>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-2 border border-[#b9a58a]/30 px-4 py-2.5 font-mono text-[10px] tracking-wider text-[#f1e8d8] transition-colors hover:bg-[#64152f] disabled:opacity-50"
            >
              <LogOut size={14} />
              {signingOut ? "SIGNING OUT..." : "SIGN OUT"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-10 lg:py-16">
        <div className="mb-12">
          <p className="font-mono text-[10px] tracking-[0.25em] text-[#9b806b]">
            AURELIS / ADMINISTRATION
          </p>

          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-serif text-5xl sm:text-6xl">
                Overview<span className="italic">.</span>
              </h1>
              <p className="mt-3 text-sm text-[#350817]/55">
                Your store, at a glance.
              </p>
            </div>

            <p className="font-mono text-[10px] text-[#350817]/50">
              SIGNED IN AS {adminEmail}
            </p>
          </div>
        </div>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="border border-[#470d20]/10 bg-white/60 p-7"
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] tracking-[0.15em] text-[#9b806b]">
                    {stat.label.toUpperCase()}
                  </p>
                  <Icon
                    size={19}
                    strokeWidth={1.4}
                    className="text-[#9b806b]"
                  />
                </div>

                <p className="mt-7 font-serif text-5xl">
                  {loading ? "—" : stat.value}
                </p>

                <p className="mt-2 text-xs text-[#350817]/45">{stat.note}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#9b806b]">
                STORE MANAGEMENT
              </p>
              <h2 className="mt-2 font-serif text-3xl">Manage your store</h2>
            </div>
            <LayoutDashboard size={21} className="text-[#9b806b]" />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Link
              href="/admin/products"
              className="group flex min-h-[210px] flex-col justify-between bg-[#470d20] p-8 text-[#f1e8d8] transition-colors hover:bg-[#64152f]"
            >
              <div className="flex items-start justify-between">
                <Package size={25} strokeWidth={1.3} />
                <ArrowUpRight
                  size={20}
                  className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </div>

              <div>
                <h3 className="font-serif text-3xl">Products</h3>
                <p className="mt-2 text-sm text-[#f1e8d8]/60">
                  Add, edit, publish and manage inventory.
                </p>
              </div>
            </Link>

            <Link
              href="/admin/categories"
              className="group flex min-h-[210px] flex-col justify-between border border-[#470d20]/15 bg-white/60 p-8 transition-colors hover:bg-white"
            >
              <div className="flex items-start justify-between">
                <Layers3
                  size={25}
                  strokeWidth={1.3}
                  className="text-[#9b806b]"
                />
                <ArrowUpRight
                  size={20}
                  className="text-[#9b806b] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </div>

              <div>
                <h3 className="font-serif text-3xl">Categories</h3>
                <p className="mt-2 text-sm text-[#350817]/55">
                  Organise your store collections.
                </p>
              </div>
            </Link>

            <div className="flex min-h-[180px] flex-col justify-between border border-[#470d20]/10 bg-white/40 p-7 opacity-70">
              <ShoppingBag size={23} strokeWidth={1.3} />
              <div>
                <h3 className="font-serif text-2xl">Orders</h3>
                <p className="mt-2 text-xs text-[#350817]/55">
                  Order management — coming next.
                </p>
              </div>
            </div>

            <div className="flex min-h-[180px] flex-col justify-between border border-[#470d20]/10 bg-white/40 p-7 opacity-70">
              <Image size={23} strokeWidth={1.3} />
              <div>
                <h3 className="font-serif text-2xl">Media library</h3>
                <p className="mt-2 text-xs text-[#350817]/55">
                  Product image management — coming next.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-[#470d20]/10 pt-6">
          <p className="font-mono text-[9px] tracking-[0.15em] text-[#350817]/40">
            AURELIS ADMINISTRATION · PRIVATE ACCESS
          </p>
        </footer>
      </div>
    </main>
  );
}
