import { createClient } from '@supabase/supabase-js';

export default async function sitemap() {
  const baseUrl = 'https://vetvisitcost.com';
  
  // Need to instantiate Supabase here since it's a server-side build step
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const links = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/vets`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/low-cost-vets`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/pet-insurance`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/bill-check`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  try {
    const { data: vets } = await supabase.from('vets').select('slug, city, state, updated_at');
    const { data: procedures } = await supabase.from('procedures').select('slug');

    if (procedures && procedures.length > 0) {
      // Map national Procedure Pages (e.g. /cost/wellness-exam)
      procedures.forEach(proc => {
        links.push({
          url: `${baseUrl}/cost/${proc.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      });
    }

    if (vets && vets.length > 0) {
      const uniqueCities = new Set();

      // 1. Map all Clinic Profiles
      vets.forEach(vet => {
        if (vet.slug) {
          links.push({
            url: `${baseUrl}/vets/clinic/${vet.slug}`,
            lastModified: vet.updated_at ? new Date(vet.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
        
        if (vet.city && vet.state) {
          const citySegment = `${vet.state.toLowerCase()}/${vet.city.toLowerCase().replace(/\s+/g, '-')}`;
          uniqueCities.add(citySegment);
        }
      });

      // 2. Map all City Directory Pages (e.g. /vets/co/denver)
      uniqueCities.forEach(citySegment => {
        links.push({
          url: `${baseUrl}/vets/${citySegment}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        });

        // 3. Cross-map Procedure Pages locally (e.g. /cost/wellness-exam/co/denver)
        if (procedures && procedures.length > 0) {
          procedures.forEach(proc => {
            links.push({
              url: `${baseUrl}/cost/${proc.slug}/${citySegment}`,
              lastModified: new Date(),
              changeFrequency: 'daily',
              priority: 0.9, // These are high priority SEO landing pages!
            });
          });
        }
      });
    }
  } catch (e) {
    console.error("Failed to generate sitemap", e);
  }

  return links;
}
