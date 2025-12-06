import type { Metadata } from "next";
import AuthProvider from "./context/AuthProvider";
import AuthButton from '../components/AuthButton';
import Link from "next/link";
import './globals.css'
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


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
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
