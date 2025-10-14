import type { Metadata } from "next";
import Link from "next/link";
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
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                GameTrade
              </Link>
              <div className="flex gap-6">
                <Link href="/games" className="text-gray-700 hover:text-blue-600">
                  Browse Games
                </Link>
                <Link href="/games/add" className="text-gray-700 hover:text-blue-600">
                  Add Game
                </Link>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
