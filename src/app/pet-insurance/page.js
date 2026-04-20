"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Check, X, Info } from 'lucide-react';
import Link from 'next/link';

export default function PetInsurancePage() {
  const [petType, setPetType] = useState('dog');
  const [age, setAge] = useState('');
  
  return (
    <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 p-3 rounded-2xl mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Is Pet Insurance Worth It?</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Compare lifetime vet costs vs. insurance premiums. 
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Calculator */}
        <div className="glass-panel p-8 rounded-3xl h-fit">
          <h2 className="text-2xl font-bold mb-6">Estimate Your Costs</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex gap-2">
              <button 
                onClick={() => setPetType('dog')} 
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${petType === 'dog' ? 'bg-brand-600 text-white' : 'bg-white/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}
              >
                Dog 🐶
              </button>
              <button 
                onClick={() => setPetType('cat')} 
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${petType === 'cat' ? 'bg-brand-600 text-white' : 'bg-white/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}
              >
                Cat 🐱
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Pet's Age (Years)</label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 3" 
                className="w-full px-4 py-3 bg-white/80 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Avg. Annual Routine Care</span>
              <span className="font-bold">${petType === 'dog' ? 250 : 150}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Est. Emergency Event (1 in 3 chance)</span>
              <span className="font-bold">$800 - $1,500</span>
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between items-center">
              <span className="font-bold">Avg. Insurance Cost</span>
              <span className="text-brand-600 dark:text-brand-400 font-bold">${petType === 'dog' ? '45' : '25'} / mo</span>
            </div>
          </div>
        </div>

        {/* Top Affiliates */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Top Rated Providers</h2>
          
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Healthy Paws</h3>
                <p className="text-sm text-gray-500">Best for comprehensive coverage without caps.</p>
              </div>
              <div className="bg-brand-100 text-brand-700 text-xs px-2 py-1 rounded font-bold uppercase">Top Pick</div>
            </div>
            <ul className="text-sm space-y-1 mb-4 text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> No annual caps</li>
              <li className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Fast claims</li>
            </ul>
            <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 rounded-lg flex justify-center items-center gap-2 group-hover:bg-brand-600 dark:group-hover:bg-brand-600 dark:group-hover:text-white transition-colors">
              Get Quote <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Trupanion</h3>
                <p className="text-sm text-gray-500">Best for direct vet payments.</p>
              </div>
            </div>
            <ul className="text-sm space-y-1 mb-4 text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Pays vets directly</li>
              <li className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> 90% coverage on new conditions</li>
            </ul>
            <button className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 group-hover:bg-brand-600 group-hover:text-white dark:group-hover:bg-brand-600 dark:group-hover:text-white transition-colors">
              Get Quote <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
