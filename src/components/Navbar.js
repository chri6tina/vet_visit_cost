"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartPulse, Stethoscope, Search, ShieldCheck, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link 
              href="/vets" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${pathname === '/vets' ? 'bg-brand-50 text-brand-600 dark:bg-gray-800 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300'} hover:bg-gray-50 hover:text-brand-600 dark:hover:bg-gray-800 block px-4 py-3 rounded-xl text-base font-medium transition-colors`}
            >
              Vet Directory
            </Link>
            <Link 
              href="/low-cost-vets" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${pathname === '/low-cost-vets' ? 'bg-accent-teal-50 text-accent-teal-600 dark:bg-gray-800 dark:text-accent-teal-400' : 'text-gray-600 dark:text-gray-300'} hover:bg-gray-50 hover:text-accent-teal-600 dark:hover:bg-gray-800 block px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center gap-2`}
            >
              <HeartPulse className="w-5 h-5" /> Low-Cost Clinics
            </Link>
            <Link 
              href="/bill-check" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${pathname === '/bill-check' ? 'bg-brand-50 text-brand-600 dark:bg-gray-800 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300'} hover:bg-gray-50 hover:text-brand-600 dark:hover:bg-gray-800 block px-4 py-3 rounded-xl text-base font-medium transition-colors`}
            >
              Was My Bill Fair?
            </Link>
            
            <Link 
              href="/vets" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="sm:hidden w-full flex items-center justify-center gap-2 text-base font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-3 mt-4 rounded-xl transition-colors dark:bg-brand-900/30 dark:text-brand-300 dark:hover:bg-brand-900/50"
            >
              <Search className="w-5 h-5" /> Find Vet
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
