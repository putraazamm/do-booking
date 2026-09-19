"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const supabase = createClient();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(next);
    router.refresh();
  };

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-sm px-6 py-16">
        <h1 className="mb-6 text-xl font-bold text-ink">
          {mode === "sign-in" ? "Sign in" : "Create an account"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "sign-up" && (
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-line bg-base px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line bg-base px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line bg-base px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />

          {error && <p className="text-sm text-secondary">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "sign-in"
                ? "Sign in"
                : "Sign up"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          className="mt-4 text-sm text-primary hover:underline"
        >
          {mode === "sign-in"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
