import { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import SliceStackCanvas from "@/components/three/SliceStackCanvas";

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink flex">
      <div className="hidden lg:flex lg:w-1/2 relative border-r border-line overflow-hidden">
        <div className="absolute inset-0">
          <SliceStackCanvas dense />
        </div>
        <div className="relative z-10 p-12 flex flex-col justify-between w-full pointer-events-none">
          <Link href="/" className="pointer-events-auto w-fit">
            <Logo />
          </Link>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber/80 mb-3">
              Diagnostic imaging, structured
            </p>
            <p className="font-display text-2xl leading-snug max-w-md text-bone">
              Every slice tells a story. MedScan reads all of them in parallel.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <h1 className="font-display text-2xl font-semibold text-bone">{title}</h1>
          <p className="text-sm text-muted mt-1.5 mb-8">{subtitle}</p>
          {children}
          <div className="mt-6 text-sm text-muted text-center">{footer}</div>
        </div>
      </div>
    </div>
  );
}
