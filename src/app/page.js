"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Activity, ShieldCheck, HeartPulse, ShieldPlus, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [petType, setPetType] = useState('dog');
  const [procedure, setProcedure] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Smart Search States
  const [proceduresList, setProceduresList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProcedures = async () => {
      const { data } = await supabase.from('procedures').select('name, slug');
      if (data) setProceduresList(data);
    };
    fetchProcedures();
  }, []);

  useEffect(() => {
    if (procedure.length > 1) {
      const lower = procedure.toLowerCase();
      setSuggestions(proceduresList.filter(p => p.name.toLowerCase().includes(lower)));
    } else {
      setSuggestions([]);
    }
  }, [procedure, proceduresList]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const petTypes = [
    { id: 'dog', label: 'Dog', icon: '🐶' },
    { id: 'cat', label: 'Cat', icon: '🐱' },
    { id: 'exotic', label: 'Exotic & Other', icon: '🦜' },
  ];

  const popularProcedures = [
    "Wellness Exam", "Spay (Dog)", "Dental Cleaning", "Emergency Room Exam"
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = zipCode ? `?zip=${encodeURIComponent(zipCode)}` : '';

    if (suggestions.length > 0) {
      router.push(`/cost/${suggestions[0].slug}${queryParams}`);
    } else if (procedure) {
      // Fallback
      const slug = procedure.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '');
      router.push(`/cost/${slug}${queryParams}`);
    }
  };

  const handleSuggestionClick = (name) => {
    setProcedure(name);
    setShowSuggestions(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Abstract Animated Shapes */}
      <div className="absolute top-0 inset-x-0 overflow-hidden -z-10 pointer-events-none h-screen">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl opacity-50" />
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-accent-teal-400/20 blur-3xl opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-4xl w-full mx-auto"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 text-sm font-semibold mb-6">
          <ShieldCheck className="w-4 h-4" /> Data-backed vet care pricing
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Find out what your vet visit <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-teal-400">should cost.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
          Don't get overcharged. Compare national and local prices, find affordable vets near you, and read honest reviews from pet parents.
        </p>

        {/* Search Interface */}
        <div className="glass-panel rounded-3xl p-4 md:p-6 shadow-xl w-full max-w-3xl mx-auto mb-8 relative z-10">
          
          {/* Pet Type Selector */}
          <div className="flex gap-2 justify-center mb-6">
            {petTypes.map((pt) => (
              <button
                key={pt.id}
                onClick={() => setPetType(pt.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 font-medium ${
                  petType === pt.id 
                    ? 'bg-brand-500 text-white shadow-md transform scale-105' 
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>{pt.icon}</span> {pt.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 group" ref={wrapperRef}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500">
                <Activity className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={procedure}
                onChange={(e) => {
                  setProcedure(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="What procedure? (e.g., Dental Cleaning)"
                className="w-full pl-11 pr-4 py-4 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white text-lg"
                required
              />
              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 mt-2 w-full z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden"
                  >
                    <ul>
                      {suggestions.slice(0, 6).map((suggestion) => (
                        <li key={suggestion.slug}>
                          <button
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion.name)}
                            className="w-full text-left px-4 py-3 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-gray-700 dark:hover:text-brand-300 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0 font-medium text-gray-800 dark:text-gray-200"
                          >
                            {suggestion.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative flex-1 md:max-w-xs group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500">
                <MapPin className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="ZIP or City"
                className="w-full pl-11 pr-4 py-4 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white text-lg"
                required
              />
            </div>

            <button 
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg hover:shadow-brand-500/30 flex items-center justify-center gap-2"
            >
              Search <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Links */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Popular:</span>
            {popularProcedures.map((proc) => (
              <button
                key={proc}
                onClick={() => setProcedure(proc)}
                className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-300 transition-colors border border-transparent hover:border-brand-200 dark:hover:border-brand-800"
              >
                {proc}
              </button>
            ))}
          </div>
        </div>

        {/* Low Cost Vets CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mt-8"
        >
          <Link href="/low-cost-vets" className="group glass-panel flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all cursor-pointer">
            <div className="bg-accent-teal-100 dark:bg-accent-teal-900/30 p-2 rounded-full text-accent-teal-600 dark:text-accent-teal-400">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900 dark:text-white group-hover:text-accent-teal-600 dark:group-hover:text-accent-teal-400 transition-colors">Low-Cost Clinics</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Find nonprofits & SPCA near you</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-accent-teal-500 ml-auto transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link href="/vets" className="group glass-panel flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all cursor-pointer">
            <div className="bg-brand-100 dark:bg-brand-900/30 p-2 rounded-full text-brand-600 dark:text-brand-400">
              <ShieldPlus className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Vet Directory</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Search top-rated vets with real prices</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-500 ml-auto transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 grid grid-cols-3 gap-6 border-t border-gray-200 dark:border-gray-800 pt-10"
        >
          <div className="text-center">
            <div className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-1">50+</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Procedures Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-1">8,204</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Price Reports</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-1">2k+</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Verified Clinics</div>
          </div>
        </motion.div>

      </motion.div>
    </main>
  );
}
