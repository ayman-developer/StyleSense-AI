import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import ChatWidget from "@/components/ChatWidget";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "StyleSense AI | Premium Personal Stylist",
  description: "Your AI-powered personal fashion stylist for the perfect outfit every time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 px-4 md:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
