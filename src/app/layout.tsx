import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
