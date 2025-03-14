'use client';

import { usePathname } from "next/navigation"
import ProfileMenu from "@/components/ProfileMenu"
import Link from "next/link"
import Image from 'next/image'

export function Header() {
  const pathname = usePathname()
  const isAuthPage = pathname === '/' || pathname === '/signup' || pathname === '/login'

  if (isAuthPage) return null;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="container mx-auto pl-2 pr-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center group">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center mr-2 transition-colors">
              <Image 
                src="/images/bread.png" 
                alt="Bread logo" 
                width={20}
                height={20}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold text-[#9c6644] group-hover:text-[#8b5a3b] transition-colors">Bread</span>
            <span className="text-xl font-bold text-[#d4a373] group-hover:text-[#c49363] transition-colors">AI</span>
          </div>
        </Link>
        <ProfileMenu />
      </div>
    </header>
  )
} 