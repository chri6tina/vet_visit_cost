"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartPulse, Stethoscope, Search, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 inset-x-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-brand-600 text-white p-1.5 rounded-lg group-hover:bg-brand-500 transition-colors">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
              VetVisit<span className="text-brand-600 dark:text-brand-400">Cost</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            <Link 
              href="/vets" 
              className={`${pathname === '/vets' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300'} hover:text-brand-600 transition-colors`}
            >
              Vet Directory
            </Link>
            <Link 
              href="/low-cost-vets" 
              className={`${pathname === '/low-cost-vets' ? 'text-accent-teal-600 dark:text-accent-teal-400' : 'text-gray-600 dark:text-gray-300'} hover:text-accent-teal-600 transition-colors flex items-center gap-1.5`}
            >
              <HeartPulse className="w-4 h-4" /> Low-Cost Clinics
            </Link>
            <Link 
              href="/bill-check" 
              className={`${pathname === '/bill-check' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300'} hover:text-brand-600 transition-colors`}
            >
              Was My Bill Fair?
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/vets" 
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-full transition-colors dark:bg-brand-900/30 dark:text-brand-300 dark:hover:bg-brand-900/50"
            >
              <Search className="w-4 h-4" /> Find Vet
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
