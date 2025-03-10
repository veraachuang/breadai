'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  LogOut,
  Settings,
  Wallet,
  ChevronDown,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLinkBank = () => {
    router.push('/link-bank');
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-1 rounded-full p-2 hover:bg-[#f8f5f0] transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-[#9c6644] text-white flex items-center justify-center">
          <User size={20} />
        </div>
        <ChevronDown size={16} className={`text-[#3a3027] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-[#e6dfd5]">
          <div className="py-1" role="menu">
            <button
              onClick={handleLinkBank}
              className="flex w-full items-center px-4 py-2 text-sm text-[#3a3027] hover:bg-[#f8f5f0]"
            >
              <Wallet className="mr-2" size={16} />
              Link Bank Account
            </button>
            <button
              onClick={() => {
                router.push('/settings');
                setIsOpen(false);
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-[#3a3027] hover:bg-[#f8f5f0]"
            >
              <Settings className="mr-2" size={16} />
              Settings
            </button>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center px-4 py-2 text-sm text-[#3a3027] hover:bg-[#f8f5f0]"
            >
              <LogOut className="mr-2" size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 