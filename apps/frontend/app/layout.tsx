import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drawscape | Hand-drawn look & feel • Collaborative whiteboard",
  description:
    "Drawscape is a virtual collaborative whiteboard tool that lets you easily sketch diagrams that have a hand-drawn feel to them. Free & open-source.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col selection:bg-[#6965db]/20 selection:text-[#1e1e1e]">
        {children}
      </body>
    </html>
  );
}
