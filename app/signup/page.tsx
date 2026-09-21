"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { signup } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function SignupPage() {
  const router = useRouter();
  const setSession = useAppStore((s) => s.setSession);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signup(name, email, password);
      setSession(res);
      router.push("/dashboard");
    } catch {
      setError("Couldn't create your account. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up MedScan for your team in a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-amber hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Full name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dr. Jane Okafor"
        />
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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
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
          {loading ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-xs text-muted-2 text-center font-mono">
          No backend connected yet — this creates a local demo session.
        </p>
      </form>
    </AuthLayout>
  );
}
