"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { login } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAppStore((s) => s.setSession);
  const [email, setEmail] = useState("demo@medscan.ai");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      setSession(res);
      router.push("/dashboard");
    } catch {
      setError("Couldn't sign you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to keep reading scans."
      footer={
        <>
          No account yet?{" "}
          <Link href="/signup" className="text-amber hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@hospital.org"
        />
        <TextField
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-coral">{error}</p>}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading}
          icon={!loading ? <ArrowRight size={18} /> : undefined}
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-xs text-muted-2 text-center font-mono">
          No backend connected yet — any email/password signs you in.
        </p>
      </form>
    </AuthLayout>
  );
}
