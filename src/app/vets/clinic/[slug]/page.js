import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Globe, ShieldCheck, AlertTriangle, CheckCircle2, HeartPulse } from 'lucide-react';
import PriceSubmissionForm from '@/components/PriceSubmissionForm';

export default async function VetProfilePage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 1. Fetch Vet Data
  const { data: vet, error } = await supabase
    .from('vets')
    .select('*')
    .eq('slug', slug)
    .single();

  // 2. Fetch procedure list for the dropdown and interlinking
  const { data: procedures } = await supabase
    .from('procedures')
    .select('id, name, slug')
    .order('name');

  if (error || !vet) {
    return (
      <main className="min-h-screen pt-32 text-center max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Clinic Not Found</h1>
        <p className="mb-8">We couldn't find the vet clinic you were looking for.</p>
        <Link href="/" className="text-brand-600 font-medium hover:underline">← Return Home</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <Link href={`/vets/${vet.state?.toLowerCase()}/${vet.city?.toLowerCase().replace(/\s+/g, '-')}`} className="inline-flex items-center text-brand-600 hover:text-brand-800 dark:text-brand-400 mb-8 font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to {vet.city} Vets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 pr-10 tracking-tight">
              {vet.name}
            </h1>
            
            {vet.special_instructions && (
              <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-600 p-5 rounded-xl shadow-sm">
                <h3 className="font-bold flex items-center gap-2 text-yellow-800 dark:text-yellow-400 mb-1">
                  <AlertTriangle className="w-5 h-5" /> Important Clinic Guidelines
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                  {vet.special_instructions}
                </p>
              </div>
            )}

            
            <div className="flex flex-wrap gap-3 mb-6">
              {vet.accepts_new_patients && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm font-bold px-4 py-1.5 rounded-full dark:bg-green-900/30 dark:text-green-300">
                  <ShieldCheck className="w-4 h-4" /> Accepting Patients
                </span>
              )}
              {vet.emergency_care && (
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-sm font-bold px-4 py-1.5 rounded-full dark:bg-red-900/30 dark:text-red-300">
                  <AlertTriangle className="w-4 h-4" /> Emergency Care
                </span>
              )}
              {vet.low_cost && (
                <span className="inline-flex items-center gap-1 bg-accent-teal-100 text-accent-teal-800 text-sm font-bold px-4 py-1.5 rounded-full dark:bg-accent-teal-900/30 dark:text-accent-teal-300">
                  <HeartPulse className="w-4 h-4" /> Low Cost Verified
                </span>
              )}
            </div>

            <div className="space-y-4 text-gray-600 dark:text-gray-300 text-lg">
              <p className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 dark:bg-brand-900/30"><MapPin className="w-5 h-5"/></span>
                {vet.address}, {vet.city}, {vet.state} {vet.zip}
              </p>
              {vet.phone && (
                <p className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 dark:bg-brand-900/30"><Phone className="w-5 h-5"/></span>
                  <a href={`tel:${vet.phone.replace(/[^0-9+]/g, '')}`} className="hover:underline">{vet.phone}</a>
                </p>
              )}
              {vet.website && (
                <p className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 dark:bg-brand-900/30"><Globe className="w-5 h-5"/></span>
                  <a href={vet.website} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Visit Official Website</a>
                </p>
              )}
            </div>
          </div>

          {/* Reputation Section Shell */}
          {vet.reputation_summary && (() => {
            let repSummary = vet.reputation_summary;
            let repQuotes = [];
            try {
              const parsedRep = JSON.parse(vet.reputation_summary);
              if (parsedRep.summary) {
                repSummary = parsedRep.summary;
                repQuotes = parsedRep.quotes || [];
              }
            } catch (e) {
              // Keep backward compatibility if it's just a plain string
            }

            return (
              <div className="mb-4">
                <div className="bg-blue-50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/40 p-6 rounded-3xl shadow-sm mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-blue-800 dark:text-blue-400 mb-2">
                    ⭐ Community Reputation
                  </h3>
                  <p className="text-blue-800/80 dark:text-blue-300 text-base leading-relaxed">
                    {repSummary}
                  </p>
                </div>
                
                {repQuotes.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {repQuotes.map((quote, idx) => {
                      const parts = quote.split(' - ');
                      const text = parts[0]?.replace(/^"|"$/g, '');
                      const source = parts[1] || 'Community Review';
                      return (
                        <div key={idx} className="bg-white/60 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 p-5 rounded-3xl relative">
                          <span className="text-5xl text-blue-100 dark:text-blue-900/20 absolute -top-2 left-3 font-serif leading-none">"</span>
                          <blockquote className="text-sm text-gray-600 dark:text-gray-300 italic relative z-10 pt-2 px-2 leading-relaxed">
                            {text}
                          </blockquote>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 mt-3 px-2 text-right">
                            — {source}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Pricing Section Shell */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              Reported Prices
            </h2>
            <div className="bg-white/50 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl text-center shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No community prices have been reported for {vet.name} yet.</p>
              
              {/* Gap 3: Smart Interlinking for SEO Routing! */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">Compare City Averages</p>
                <div className="flex flex-col gap-2 max-w-sm mx-auto">
                  {procedures.slice(0, 3).map((proc, i) => (
                    <Link key={i} href={`/cost/${proc.slug}/${vet.state.toLowerCase()}/${vet.city.toLowerCase().replace(/ /g, '-')}`} className="text-sm bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 py-2 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors font-medium border border-brand-100 dark:border-brand-800/30">
                      View {proc.name} Cost in {vet.city}
                    </Link>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Sidebar: Crowdsourcing Widget */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <PriceSubmissionForm vetId={vet.id} vetName={vet.name} procedures={procedures} />
          </div>
        </div>

      </div>
    </main>
  );
}
