"use client";

import { useAuth } from "@/components/AuthProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Shirt, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Wardrobe", href: "/wardrobe", icon: Shirt },
    { name: "Planner", href: "/planner", icon: Calendar },
    { name: "Community", href: "/community", icon: Users },
  ];

  if (!user) return null;

  return (
    <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
        <div className="flex items-center gap-8">
          <Link href="/dashboard">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              StyleSense
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
                  <Icon className="w-4 h-4" /> {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user.photoURL && (
            <div className="relative w-8 h-8 rounded-full border border-zinc-700 overflow-hidden">
              <Image src={user.photoURL} alt="User avatar" fill className="object-cover" />
            </div>
          )}
          <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={handleSignOut}>
            <LogOut className="w-5 h-5 md:mr-2" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="md:hidden border-t border-zinc-800 px-2 py-2 flex justify-between">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 flex-1 ${isActive ? 'text-pink-400' : 'text-zinc-500'}`}>
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
