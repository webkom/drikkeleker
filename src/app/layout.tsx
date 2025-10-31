import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/context/SocketContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Drikkeleker",
  description: "GROVE drikkeleker i Abakus stil 🥵🥵",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <script
          defer
          data-domain="drikkeleker.abakus.no"
          src="https://analytics.webkom.dev/js/plausible.js"
        />
      </head>
      <body className="bg-white">
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
