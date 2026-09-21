import Link from "next/link";
import { ArrowRight, Activity, ShieldCheck, Zap } from "lucide-react";
import SliceStackCanvas from "@/components/three/SliceStackCanvas";
import Logo from "@/components/layout/Logo";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";

const FEATURES = [
  {
    icon: Zap,
    title: "Sub-second inference",
    body: "ONNX-exported CNN served through FastAPI, tuned for latency without sacrificing recall.",
  },
  {
    icon: ShieldCheck,
    title: "Built for a clinical workflow",
    body: "Every read carries a confidence score, a class breakdown, and an audit trail back to the model version.",
  },
  {
    icon: Activity,
    title: "Explainable by default",
    body: "Saliency overlays show exactly which region of the scan drove the model's call.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink text-bone overflow-hidden">
      <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-[1400px] mx-auto">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">
              Get started
            </Button>
          </Link>
        </nav>
      </header>

      <section className="relative">
        <div className="absolute inset-0 -top-10 h-[640px] pointer-events-none">
          <SliceStackCanvas />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-8 pt-16 pb-40 text-center flex flex-col items-center pointer-events-none">
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-amber/90 bg-amber/10 border border-amber/30 rounded-full px-3 py-1 mb-6">
                       oscc_Detector · ultrasound screening
          </span>
          <h1 className="font-display font-semibold text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-3xl text-glow-amber">
            Read the scan before you finish your coffee.
          </h1>
          <p className="mt-6 text-lg text-muted max-w-xl leading-relaxed">
                        MedScan AI turns a raw ultrasound scan into a structured,
                        Upload an ultrasound scan and get a structured read in seconds.
          </p>
          <div className="mt-9 flex items-center gap-3 pointer-events-auto">
            <Link href="/signup">
              <Button variant="primary" size="lg" icon={<ArrowRight size={18} />}>
                Start reading scans
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                I have an account
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-xs text-muted-2 font-mono">
            Move your cursor — the stack above tracks it.
          </p>
        </div>
      </section>

      <section className="relative z-10 max-w-[1400px] mx-auto px-8 pb-28 -mt-16">
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <Panel key={f.title} className="p-6">
              <f.icon className="text-amber" size={22} />
              <h3 className="mt-4 font-display font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{f.body}</p>
            </Panel>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-line-soft px-8 py-8 max-w-[1400px] mx-auto flex items-center justify-between text-xs text-muted-2 font-mono">
        <span>MedScan AI — for research &amp; clinical decision support, not a standalone diagnosis.</span>
        <span>Backend: FastAPI · not yet connected</span>
      </footer>
    </div>
  );
}
