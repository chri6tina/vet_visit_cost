import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Globe, ShieldCheck, HeartPulse, Stethoscope, AlertTriangle } from 'lucide-react';
import MapWidget from '@/components/MapWidget';

export const revalidate = 0; // Force Next.js to not cache 404 pages during development!

// Helper to capitalize city names (e.g., jacksonville -> Jacksonville)
function formatCityName(slug) {
  if (!slug) return '';
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default async function CityVetsDirectory({ params }) {
  // Next 15+ async params unwrap
  const resolvedParams = await params;
  const rawCity = resolvedParams.city;
  const rawState = resolvedParams.state;

  const cityName = formatCityName(rawCity);
  const stateCode = rawState.toUpperCase();

  // 1. Geocode the City to exact coordinates to feed PostGIS
  const geoQuery = encodeURIComponent(`${cityName}, ${stateCode}`);
  const mapboxRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${geoQuery}.json?types=place&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`);
  const geoData = await mapboxRes.json();
  
  let vets = [];
  let centerLat = null;
  let centerLng = null;
  
  if (geoData.features && geoData.features.length > 0) {
    const [lng, lat] = geoData.features[0].center;
    centerLat = lat;
    centerLng = lng;
    
    // 🔥 Ping the new PostGIS Engine: Get everything in a 15-mile radius!
    const { data: gisVets } = await supabase.rpc('get_vets_in_radius', {
      center_lat: lat,
      center_lng: lng,
      radius_miles: 15
    });
    
    if (gisVets && gisVets.length > 0) {
      vets = gisVets;
    }
  } 

  // If Mapbox failed, OR if PostGIS returned 0 records because the AI clinics 
  // haven't had their exact math PostGIS location plotted yet, fallback to a standard Text Search!
  if (!vets || vets.length === 0) {
    const { data: dbVets } = await supabase
      .from('vets')
      .select('*')
      .ilike('city', cityName)
      .ilike('state', stateCode);
    vets = dbVets || [];
  }

  // 2. Fetch low-cost programs
  const { data: lowCostPrograms } = await supabase
    .from('low_cost_programs')
    .select('*')
    .ilike('city', cityName)
    .ilike('state', stateCode);

  const hasVets = vets && vets.length > 0;
  const hasLowCost = lowCostPrograms && lowCostPrograms.length > 0;

  // 3. Fetch procedures for SEO cross-linking
  const { data: procedures } = await supabase.from('procedures').select('name, slug').limit(4);

  // 4. Generate JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Veterinarians in ${cityName}, ${stateCode}`,
    "description": `List of ${vets?.length || 0} vet clinics in ${cityName}`,
    "itemListElement": (vets || []).map((vet, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "VeterinaryCare",
        "name": vet.name,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": vet.address || vet.city,
          "addressLocality": cityName,
          "addressRegion": stateCode
        },
        "telephone": vet.phone
      }
    }))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-24 pb-8">
      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Link href="/vets" className="inline-flex items-center text-brand-600 hover:text-brand-800 dark:text-brand-400 mb-8 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Locations
        </Link>
      
      {/* City Hero Section */}
      <div className="mb-12 relative">
        <div className="absolute inset-0 bg-brand-100 dark:bg-brand-900/20 blur-3xl rounded-full opacity-50 -z-10" />
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
          Veterinarians in <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-teal-500">{cityName}, {stateCode}</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
          Compare local vet prices, read honest reviews, and discover affordable or non-profit pet care options directly inside {cityName}.
        </p>

        {/* SEO Cross-Linking: Drive traffic to Procedure Pages */}
        {procedures && procedures.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {procedures.map((proc, idx) => (
              <Link key={idx} href={`/cost/${proc.slug}/${stateCode.toLowerCase()}/${rawCity}`} className="inline-flex items-center text-sm font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full shadow-sm hover:border-brand-500 hover:text-brand-600 transition-colors">
                View {proc.name} Cost in {cityName} &rarr;
              </Link>
            ))}
          </div>
        )}
      </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Clinics Grid */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Stethoscope className="text-brand-500" /> Private Clinics & Hospitals
            </h2>
            <span className="text-sm font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {vets?.length || 0} Found
            </span>
          </div>

          {!hasVets ? (
            <div className="glass-panel p-8 text-center rounded-3xl">
              <p className="text-gray-500">We are currently researching clinics in {cityName}. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {vets.map((vet) => (
                <div key={vet.id} className="block glass-panel p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-700 transition-all bg-white/70 dark:bg-gray-900/70 group cursor-pointer">
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 transition-colors">{vet.name}</h3>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {vet.address || vet.city}</p>
                        {vet.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {vet.phone}</p>}
                        {vet.website && (
                          <div className="flex items-center gap-2 text-brand-600 hover:underline">
                            <Globe className="w-4 h-4" /> <a href={vet.website} target="_blank" rel="noreferrer">Website</a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                      {vet.accepts_new_patients && (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full dark:bg-green-900/30 dark:text-green-300">
                          <ShieldCheck className="w-3 h-3" /> Accepting Patients
                        </span>
                      )}
                      {vet.emergency_care && (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full dark:bg-red-900/30 dark:text-red-300">
                          <AlertTriangle className="w-3 h-3" /> Emergency Care
                        </span>
                      )}
                      {vet.low_cost && (
                        <span className="inline-flex items-center gap-1 bg-accent-teal-100 text-accent-teal-800 text-xs font-bold px-3 py-1 rounded-full dark:bg-accent-teal-900/30 dark:text-accent-teal-300">
                          <HeartPulse className="w-3 h-3" /> Low Cost
                        </span>
                      )}
                      
                      <div className="w-full mt-2 text-right">
                        <Link href={`/vets/clinic/${vet.slug}`} className="text-sm font-bold text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 hover:underline">
                          View Price Profile &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Low Cost Programs */}
        <div className="space-y-6">
          <div className="p-6 bg-accent-teal-50 dark:bg-accent-teal-900/20 rounded-3xl border border-accent-teal-100 dark:border-accent-teal-800/50 sticky top-24">
            <h3 className="text-xl font-bold text-accent-teal-900 dark:text-accent-teal-300 mb-4 flex items-center gap-2">
              <HeartPulse className="w-6 h-6 text-accent-teal-500" /> Non-Profits & Grants
            </h3>
            
            <p className="text-sm text-accent-teal-800 dark:text-accent-teal-400 mb-6">
              Financial assistance and sliding-scale veterinary care programs specifically serving the <strong>{cityName}</strong> community.
            </p>

            {!hasLowCost ? (
              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl text-sm border border-accent-teal-100 dark:border-accent-teal-800/50">
                <p className="text-gray-600 dark:text-gray-400">No programs indexed yet. Try expanding your search or look into CareCredit.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {lowCostPrograms.map(prog => (
                  <li key={prog.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-accent-teal-100 dark:border-accent-teal-800/30">
                    <strong className="block text-gray-900 dark:text-white mb-1">{prog.name}</strong>
                    <span className="text-xs text-gray-500 block mb-2">{prog.services?.join(' • ') || 'General low-cost services'}</span>
                    {prog.phone && <span className="text-brand-600 block text-xs font-bold">{prog.phone}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>

      {/* Mapbox Widget at the very bottom */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mt-16 mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
          <MapPin className="text-brand-500 w-6 h-6" /> Clinics within 15 Miles of {cityName}
        </h2>
        <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 relative z-0">
          <MapWidget 
            clinics={vets || []} 
            centerLat={centerLat || vets?.[0]?.latitude} 
            centerLng={centerLng || vets?.[0]?.longitude} 
          />
        </div>
      </div>
    </main>
    </>
  );
}
