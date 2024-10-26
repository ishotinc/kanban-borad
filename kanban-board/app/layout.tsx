import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import { Clock, BookOpen, BarChart3, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Time Task",
  description: "カンバン形式のタイムマネジメントツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen bg-gray-100">
          <aside className="w-16 bg-gray-200 shadow-md flex flex-col justify-between">
            <nav className="flex flex-col items-center py-4 space-y-8">
              <Link href="/" className="p-2 rounded-full bg-[#37AB9D] hover:bg-[#2C8A7D] transition-colors duration-200">
                <Clock size={28} color="white" />
              </Link>
              <Link href="/report" className="p-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">
                <BookOpen size={24} />
              </Link>
              <Link href="/analytics" className="p-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">
                <BarChart3 size={24} />
              </Link>
            </nav>
            <div className="mb-4">
              <Link href="/profile" className="block">
                <Avatar className="w-12 h-12 mx-auto">
                  <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Profile" />
                  <AvatarFallback>
                    <User size={24} />
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </aside>
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
