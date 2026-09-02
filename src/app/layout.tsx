import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Product Roadmap | Operations Control Tower",
  description: "Tablero interactivo de gestión tipo Product Roadmap inspirado en Asana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-sans text-slate-800 text-[15px]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
