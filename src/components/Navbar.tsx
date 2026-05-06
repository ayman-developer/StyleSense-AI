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
    <nav className="border-b border-[#E2E4F0] bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
        <div className="flex items-center gap-8">
          <Link href="/dashboard">
            <span className="text-2xl font-black bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent tracking-tight">
              StyleSense AI
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                    isActive 
                      ? 'bg-[#F3F4FF] text-[#7C3AED]' 
                      : 'text-[#6B7280] hover:text-[#7C3AED] hover:bg-[#F3F4FF]/50'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-[#E2E4F0]">
            {user.photoURL && (
              <div className="relative w-8 h-8 rounded-full border border-[#E2E4F0] overflow-hidden">
                <Image src={user.photoURL} alt="User avatar" fill className="object-cover" />
              </div>
            )}
            <span className="hidden sm:inline text-xs font-bold text-[#1A1A2E]">{user.displayName?.split(" ")[0]}</span>
          </div>
          <button 
            className="text-[#6B7280] hover:text-[#EC4899] transition-colors p-2" 
            onClick={handleSignOut}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Mobile nav */}
      <div className="md:hidden border-t border-[#E2E4F0] bg-white flex justify-around py-2 px-4 shadow-inner">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-[#7C3AED] bg-[#F3F4FF]' : 'text-[#9CA3AF]'
              }`}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
