import type { Metadata } from "next";
import AuthProvider from "./context/AuthProvider";
import AuthButton from '../components/AuthButton';
import Link from "next/link";
import './globals.css'
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Game Trading Platform",
  description: "Trade games with other gamers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
        <nav className="shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/" className="text-xl font-bold text-[#E66B1A]">
                GameTrade
              </Link>
              <div className="flex gap-6">
                <Link href="/games" className="text-gray-300 hover:text-[#E66B1A]">
                  Browse Games
                </Link>
                <Link href="/games/add" className="text-gray-300 hover:text-[#E66B1A]">
                  Add Game
                </Link>
                <Link href="/dashboard" className="text-gray-300 hover:text-[#E66B1A]">
                  Dashboard
                </Link>
                <AuthButton />
              </div>
            </div>
          </div>
        </nav>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
