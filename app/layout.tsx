import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedScan AI — Diagnostic Imaging Assistant",
  description:
    "AI-assisted medical image classification. Upload a scan, get a structured read in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-ink text-bone">
        {children}
      </body>
    </html>
  );
}
