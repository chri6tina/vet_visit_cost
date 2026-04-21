import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '@/lib/telegram';

// Helper function to actively ping a website to ensure it actually exists
async function verifyUrl(url) {
  if (!url || url.trim() === '') return null;
  try {
    // 3 second timeout so the agent doesn't hang forever
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); 
    
    // We send a lightweight HEAD request just to see if the server responds
    const response = await fetch(url, { 
      method: 'HEAD', 
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' } // Some vet sites block empty user agents
    });
    clearTimeout(timeoutId);
    
    return response.ok ? url : null;
  } catch (error) {
    console.log(`❌ Dead link detected & scrubbed: ${url}`);
    return null; // If fetch throws (e.g. DNS failure, timeout), the URL is hallucinated/dead
  }
}

// Helper to actively search the internet for deep rules AND community reputation using Tavily Search & OpenAI
async function searchOperationalRulesAndReputation(clinicName, city, state) {
  if (!process.env.TAVILY_API_KEY) return { instructions: null, reputation: null };
  try {
    const query = `What are the current operational rules, feral cat TNR trapping requirements, walk-in restrictions, or drop-off times for ${clinicName} in ${city}, ${state}? Also, what do recent community reviews and locals say about this clinic's reputation? Focus on recent data from the last 6 months.`;
    
    // 1. Actively Google the clinic using strict parameters
    const tavilyRes = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: query,
        search_depth: "advanced",
        include_answer: true,
        max_results: 5
      })
    });
    
    const tavilyData = await tavilyRes.json();
    const searchContext = tavilyData.answer || tavilyData.results?.map(r => r.content).join("\n") || "";
    
    if (!searchContext || searchContext.length < 50) return { instructions: null, reputation: null };

    // 2. Synthesize the Google results into structured JSON
    const prompt = `You are a strict data researcher cross-referencing vet clinics. You must extract two distinct things from the context below:
1. Operational Instructions: A 1-2 sentence summary of highly restrictive rules (e.g., TNR trapping, walk-in bans, drop-off times). If none exist, output "NONE".
2. Reputation: An object containing a 1 sentence overview AND up to 3 direct, short review quotes from locals/reviewers. If no reviews exist, output "NONE".

Search Context: ${searchContext}

Return EXACTLY and ONLY a valid JSON object in this format:
{
  "instructions": "The 1-2 sentences or NONE",
  "reputation": {
    "summary": "1 sentence overview...",
    "quotes": ["\\"Amazing staff\\" - Local Reviewer", "\\"Wait was long\\" - Google Reviewer"]
  }
}
If reputation is completely empty/unavailable, set "reputation": "NONE".`;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      })
    });
    
    const data = await aiRes.json();
    const parsed = JSON.parse(data.choices[0].message.content.trim());
    
    return {
      instructions: parsed.instructions === 'NONE' ? null : parsed.instructions,
      reputation: parsed.reputation === 'NONE' ? null : JSON.stringify(parsed.reputation)
    };
  } catch (e) {
    console.error(`Failed to google data for ${clinicName}`, e.message);
    return { instructions: null, reputation: null };
  }
}

// This API route acts as the "Autonomous AI Agent".
export async function GET(request) {
  // Create an admin client bypassing RLS, instead of using the public anon client.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const url = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  
  // We allow either a Bearer token (for Vercel Cron) or a ?secret= query parameter (so you can test it easily right now in the browser).
  const isAuthorized = authHeader === `Bearer ${process.env.AGENT_SECRET_KEY}` || url.searchParams.get('secret') === process.env.AGENT_SECRET_KEY;
  
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized agent execution' }, { status: 401 });
  }

  // Get target location from url (can be a Zip Code or a City, State combination)
  const targetLocation = url.searchParams.get('location') || url.searchParams.get('zip') || "Jacksonville, FL"; 
  console.log(`🤖 Agent Initialized: Researching Location: ${targetLocation}`);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Missing OPENAI_API_KEY in .env.local file.' }, { status: 500 });
  }

  try {
    const prompt = `Find up to 6 real, highly-rated veterinary clinics located precisely in or very close to ${targetLocation} in the United States. Include at least 2 non-profit or low-cost clinics if possible.
Return strictly a raw JSON array, with no markdown formatting. Keep the data as accurate to the real world as possible. Every object must have these exact properties:
- name (string)
- street (string, use the real street address)
- city (string)
- state (string, 2 letter abbreviation)
- zip (string)
- phone (string)
- website (string)
- is_low_cost (boolean)
- services (array of strings. YOU MUST EXACTLY MATCH ONE OF THESE STRINGS AND NONE OTHER: ["Wellness Exam", "Vaccines", "Spay / Neuter", "Dental Cleaning", "Euthanasia"])
- accepts_new_patients (boolean)
- emergency_care (boolean)`;

    console.log("🤖 Querying OpenAI (GPT-4o Advanced Model)...");
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o", // The smartest flagship model available
        messages: [
          { role: "system", content: "You are a senior data architect. You output only strictly formatted JSON arrays. You strictly refuse to hallucinate placeholder data." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1 // Keep creativity extremely low to mathematically reduce hallucinations
      })
    });

    const data = await aiResponse.json();
    
    if (data.error) {
      throw new Error(`OpenAI Error: ${data.error.message}`);
    }

    let rawJsonContent = data.choices[0].message.content.trim();
    // Guard against OpenAI sometimes wrapping json in markdown explicitly
    if (rawJsonContent.startsWith('```json')) {
      rawJsonContent = rawJsonContent.replace(/^```json/, '').replace(/```$/, '').trim();
    }

    const clinics = JSON.parse(rawJsonContent);
    console.log(`🤖 Agent parsed ${clinics.length} clinics. Pushing to Supabase...`);

    const insertedVets = [];
    const insertedLowCost = [];

    // Push the findings into our database
    for (const clinic of clinics) {
      // Actively verify the website exists; if dead/hallucinated, it sets it to null
      const liveWebsite = await verifyUrl(clinic.website);

      // If the website works, actively search for operational rules AND community reviews utilizing the AI Search Engine
      let specificInstructions = null;
      let reputationSummary = null;
      
      if (liveWebsite) {
        console.log(`🔎 Seeking latest 2026 data & reviews for ${clinic.name}...`);
        const enrichmentData = await searchOperationalRulesAndReputation(clinic.name, clinic.city, clinic.state);
        specificInstructions = enrichmentData.instructions;
        reputationSummary = enrichmentData.reputation;
      }

      // 1.5 Geocode the clinic address via Mapbox so they populate the maps!
      let lat = null;
      let lng = null;
      try {
        const geoQuery = encodeURIComponent(`${clinic.street}, ${clinic.city}, ${clinic.state} ${clinic.zip}`);
        const mapboxRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${geoQuery}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`);
        const geoData = await mapboxRes.json();
        if (geoData.features && geoData.features.length > 0) {
           [lng, lat] = geoData.features[0].center;
        }
      } catch (e) {
         console.error("Geocoding failed for AI agent clinic", e);
      }

      // 1. Insert into the main `vets` directory
      const { data: vetData, error: vetErr } = await supabaseAdmin.from('vets').upsert({
        name: clinic.name,
        slug: clinic.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        address: clinic.street,
        city: clinic.city,
        state: clinic.state,
        zip: clinic.zip,
        phone: clinic.phone,
        website: liveWebsite,
        low_cost: clinic.is_low_cost,
        emergency_care: clinic.emergency_care,
        accepts_new_patients: clinic.accepts_new_patients,
        special_instructions: specificInstructions,
        reputation_summary: reputationSummary,
        latitude: lat,
        longitude: lng
      }, { onConflict: 'slug' }).select();
      
      if (!vetErr && vetData && vetData.length > 0) {
        insertedVets.push(vetData[0]);
      } else if (vetErr) {
        console.error("Failed to insert vet:", vetErr);
      }

      // 2. If it is verified low-cost, dual-insert into `low_cost_programs`
      if (clinic.is_low_cost) {
        const { data: lowData, error: lowErr } = await supabaseAdmin.from('low_cost_programs').insert({
          name: clinic.name,
          city: clinic.city,
          state: clinic.state,
          zip: clinic.zip,
          phone: clinic.phone,
          website: liveWebsite,
          services: clinic.services,
          special_instructions: specificInstructions,
          reputation_summary: reputationSummary,
          last_verified: new Date().toISOString()
        }).select();

        if (!lowErr && lowData && lowData.length > 0) {
          insertedLowCost.push(lowData[0]);
        }
      }
    }

    const msg = `
🤖 <b>MANAGER BOT: ENRICHMENT AGENT</b> 🤖
<b>Target:</b> <i>${targetLocation}</i>
<b>Discovered:</b> ${clinics.length} AI Results
<b>Upserted Clinics:</b> ${insertedVets.length}
<b>Low Cost Additions:</b> ${insertedLowCost.length}
<b>Status:</b> Market Expansion Successful.
    `;
    await sendTelegramMessage(msg.trim());

    return NextResponse.json({ 
      success: true, 
      message: `Agent successfully researched and injected data for ${targetLocation}`,
      clinicsDiscovered: clinics.length,
      vetsInserted: insertedVets.length,
      lowCostInserted: insertedLowCost.length,
      details: clinics
    });

  } catch (error) {
    console.error("Agent failed:", error);
    await sendTelegramMessage(`⚠️ <b>MANAGER BOT ALERT</b> ⚠️\nEnrichment Agent crashed while hunting: <i>${url.searchParams.get('location') || 'Unknown Target'}</i>\nError: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
