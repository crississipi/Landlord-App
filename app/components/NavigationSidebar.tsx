import React from 'react';
import { TbLayoutDashboard, TbMessage, TbTool, TbUsers, TbSettings, TbHome, TbReceipt, TbLogout } from 'react-icons/tb';
import { ChangePageProps } from '@/types';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

interface NavigationSidebarProps extends ChangePageProps {
  currentPage: number;
}

const NavigationSidebar = ({ setPage, currentPage }: NavigationSidebarProps) => {
  const navItems = [
    { id: 0, label: 'Dashboard', icon: TbLayoutDashboard },// Assuming Page 1 is Analytics/Stats
    { id: 14, label: 'Properties', icon: TbHome },
    { id: 5, label: 'Tenants', icon: TbUsers },
    { id: 4, label: 'Maintenance', icon: TbTool },
    { id: 13, label: 'Billing', icon: TbReceipt },
    { id: 2, label: 'Messages', icon: TbMessage },
    { id: 6, label: 'Settings', icon: TbSettings },
  ];

  const handleLogout = async () => {
    try {
      // Call logout endpoint to update isOnline status
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Sign out regardless of logout endpoint result
      signOut({ callbackUrl: '/' });
    }
  };

  return (
    <div className="hidden lg:flex flex-col w-64 h-full bg-customViolet text-white flex-shrink-0 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <Image
          src="/loading_logo.svg"
          alt="Co-Living Logo"
          height={40}
          width={40}
          className="w-8 h-8"
        />
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-white/60 uppercase tracking-wider">
          Menu
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm lg:text-xs font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'bg-white text-customViolet shadow-md' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="text-lg lg:text-base" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm lg:text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-200"
        >
          <TbLogout className="text-lg lg:text-base" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default NavigationSidebar;
