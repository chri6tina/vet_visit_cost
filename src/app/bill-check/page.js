"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, DollarSign, MapPin, Activity, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function BillCheckPage() {
  const [procedure, setProcedure] = useState('');
  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState('');
  const [result, setResult] = useState(null);

  const handleCheck = (e) => {
    e.preventDefault();
    if (!amount || !procedure) return;

    const charged = parseFloat(amount.replace(/[^0-9.]/g, ''));
    
    // Mock simulation logic
    const avgLow = 150;
    const avgHigh = 350;
    const avgMid = 250;
    
    let classification = "about average";
    let statusId = "normal"; // normal, high, low, very-high

    if (charged < avgLow) {
      classification = "below average";
      statusId = "low";
    } else if (charged > avgHigh * 1.5) {
      classification = "significantly above average";
      statusId = "very-high";
    } else if (charged > avgHigh) {
      classification = "above average";
      statusId = "high";
    }

    setResult({
      charged,
      avgLow,
      avgHigh,
      avgMid,
      classification,
      statusId,
      location: location || "your area"
    });
  };

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col items-center">
      
      <div className="text-center mb-10 w-full">
        <div className="inline-flex items-center justify-center bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 p-3 rounded-2xl mb-4">
          <Receipt className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Was My Bill Fair?</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Worried you might have overpaid? Enter your bill details below. We'll compare it against thousands of community reports.
        </p>
      </div>

      <div className="w-full relative">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 md:p-10 rounded-3xl w-full max-w-2xl mx-auto shadow-2xl"
            >
              <form onSubmit={handleCheck} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    What procedure was performed?
                  </label>
                  <div className="relative">
                    <Activity className="absolute left-4 top-4 text-gray-400 w-5 h-5 pointer-events-none" />
                    <input 
                      type="text" 
                      value={procedure}
                      onChange={(e) => setProcedure(e.target.value)}
                      placeholder="e.g. Dental Cleaning, Wellness Exam, Spay" 
                      className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder-gray-400 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Amount charged
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-4 text-gray-400 w-5 h-5 pointer-events-none" />
                      <input 
                        type="tel" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00" 
                        className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-lg"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Location (City or ZIP)
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-400 w-5 h-5 pointer-events-none" />
                      <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. 32256" 
                        className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-brand-500/30 flex justify-center items-center gap-2 mt-4"
                >
                  Analyze My Bill
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 md:p-10 rounded-3xl w-full max-w-2xl mx-auto shadow-2xl space-y-8"
            >
              <div className="text-center">
                <div className={`inline-flex items-center justify-center p-4 rounded-full mb-4 ${
                  result.statusId === 'high' || result.statusId === 'very-high' 
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                    : result.statusId === 'low' 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                }`}>
                  {result.statusId === 'high' || result.statusId === 'very-high' ? <ShieldAlert className="w-10 h-10" /> : <CheckCircle className="w-10 h-10" />}
                </div>
                <h2 className="text-3xl font-extrabold mb-2">
                  Your bill is <span className={
                    result.statusId === 'very-high' ? 'text-red-600 dark:text-red-500' :
                    result.statusId === 'high' ? 'text-orange-500' :
                    result.statusId === 'low' ? 'text-green-600 dark:text-green-500' :
                    'text-brand-600 dark:text-brand-400'
                  }>{result.classification}</span>.
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  The average for <strong className="text-gray-900 dark:text-white">{procedure}</strong> in {result.location} is <strong className="text-gray-900 dark:text-white">${result.avgLow}–${result.avgHigh}</strong>. You were charged <strong>${result.charged.toFixed(2)}</strong>.
                </p>
              </div>

              {/* Context / Soft Suggestions */}
              <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" /> What you should know
                </h3>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                    If you're concerned about the cost, you can ask your vet for an itemized invoice. They should gladly explain each fee.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                    For future bills over $500, getting a second opinion is always reasonable and common in veterinary care.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                    Emergency clinics are typically 20-40% more expensive than standard veterinary offices.
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => setResult(null)} 
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Check Another Bill
                </button>
                <button 
                  className="flex-1 bg-gradient-to-r from-brand-600 to-accent-teal-500 hover:from-brand-700 hover:to-accent-teal-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-transform focus:scale-[0.98]"
                >
                  Submit Your Price (Help Others)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </main>
  );
}
