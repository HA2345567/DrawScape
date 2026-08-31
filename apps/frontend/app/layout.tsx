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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;600;700&family=Inter:wght@300;400;500;600;700;800&family=Patrick+Hand&family=Shantell+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col selection:bg-[#6965db]/20 selection:text-[#1e1e1e]">
        {children}
      </body>
    </html>
  );
}
