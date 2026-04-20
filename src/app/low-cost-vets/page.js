import Link from 'next/link';
import { ArrowLeft, HeartPulse } from 'lucide-react';

export default function LowCostVets() {
  return (
    <main className="min-h-screen p-8 sm:p-24 pt-32 max-w-7xl mx-auto">
      <Link href="/" className="inline-flex items-center text-accent-teal-600 hover:text-accent-teal-800 dark:text-accent-teal-400 mb-8 font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Link>
      <h1 className="text-4xl font-extrabold mb-4 flex items-center gap-3">
        Low-Cost Clinics <HeartPulse className="w-8 h-8 text-accent-teal-500" />
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Find affordable vet care options, nonprofits, and humane societies.
      </p>
      
      <div className="glass-panel rounded-3xl p-12 text-center border-dashed border-2 border-accent-teal-200 dark:border-accent-teal-800">
        <h2 className="text-2xl font-bold mb-2">Low-Cost Directory Coming Soon</h2>
        <p className="text-gray-500">Compiling and tracking localized low-cost options.</p>
      </div>
    </main>
  );
}
