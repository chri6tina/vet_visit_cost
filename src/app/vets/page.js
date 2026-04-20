import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function VetsDirectory() {
  return (
    <main className="min-h-screen p-8 sm:p-24 pt-32 max-w-7xl mx-auto">
      <Link href="/" className="inline-flex items-center text-brand-600 hover:text-brand-800 dark:text-brand-400 mb-8 font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Link>
      <h1 className="text-4xl font-extrabold mb-4">Vet Directory</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Search for top-rated vets with real prices near you.
      </p>
      
      <div className="glass-panel rounded-3xl p-12 text-center border-dashed border-2 border-brand-200 dark:border-brand-800">
        <h2 className="text-2xl font-bold mb-2">Vet Map & List View Coming Soon</h2>
        <p className="text-gray-500">Integrating Mapbox and Supabase geo-queries.</p>
      </div>
    </main>
  );
}
