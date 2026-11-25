"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError || !data.user) {
        throw new Error("Invalid email or password.");
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        throw new Error(
          "This account is not authorized to access AURELIS Admin.",
        );
      }

      const nextPath = searchParams.get("next");
      const destination =
        nextPath?.startsWith("/admin/") && !nextPath.startsWith("/admin/login")
          ? nextPath
          : "/admin";

      router.replace(destination);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#350817] px-5 py-16 text-[#f1e8d8]">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#64152f]/40 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#0a0a0b]/60 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[440px]">
        <Link
          href="/"
          className="mb-14 block text-center font-serif text-4xl tracking-[0.2em] text-[#f1e8d8]"
        >
          AURELIS
        </Link>

        <div className="border border-[#b9a58a]/25 bg-[#470d20]/70 p-8 shadow-2xl backdrop-blur-xl sm:p-11">
          <div className="mb-9">
            <div className="mb-5 flex h-12 w-12 items-center justify-center border border-[#b9a58a]/40 text-[#d2bea5]">
              <LockKeyhole size={20} strokeWidth={1.4} />
            </div>

            <p className="font-mono text-[10px] tracking-[0.25em] text-[#d2bea5]">
              PRIVATE ACCESS
            </p>

            <h1 className="mt-3 font-serif text-4xl">
              Welcome <span className="italic">back.</span>
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#f1e8d8]/65">
              Sign in to manage your AURELIS store.
            </p>
          </div>

          {searchParams.get("error") === "unauthorized" && (
            <p className="mb-5 border border-red-300/30 bg-red-950/30 p-3 text-sm text-red-200">
              This account is not authorized for admin access.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block font-mono text-[10px] tracking-[0.15em] text-[#d2bea5]"
              >
                BUSINESS EMAIL
              </label>

              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@aurelis.com"
                className="w-full border border-[#b9a58a]/30 bg-[#350817] px-4 py-3.5 text-sm text-[#f1e8d8] outline-none transition-colors placeholder:text-[#f1e8d8]/30 focus:border-[#d2bea5]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block font-mono text-[10px] tracking-[0.15em] text-[#d2bea5]"
              >
                PASSWORD
              </label>

              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-[#b9a58a]/30 bg-[#350817] px-4 py-3.5 pr-12 text-sm text-[#f1e8d8] outline-none transition-colors placeholder:text-[#f1e8d8]/30 focus:border-[#d2bea5]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d2bea5] transition-colors hover:text-[#f1e8d8]"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="border border-red-300/30 bg-red-950/30 p-3 text-sm text-red-200"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-between bg-[#f1e8d8] px-5 py-4 font-mono text-[11px] tracking-[0.15em] text-[#470d20] transition-colors hover:bg-[#d2bea5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{loading ? "AUTHENTICATING..." : "SIGN IN TO ADMIN"}</span>

              {!loading && (
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-[#b9a58a]/20 pt-6 text-center">
            <p className="font-mono text-[9px] tracking-[0.15em] text-[#f1e8d8]/40">
              AUTHORIZED PERSONNEL ONLY
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[#f1e8d8]/40">
          <Link href="/" className="transition-colors hover:text-[#d2bea5]">
            Return to storefront
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#350817] text-[#f1e8d8]">
          <p className="font-mono text-xs tracking-[0.2em]">
            LOADING SECURE ACCESS...
          </p>
        </main>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
