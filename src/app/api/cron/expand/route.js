import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '@/lib/telegram';

// Vercel Cron Agent to autonomously pick and research new cities daily
export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && new URL(request.url).searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized Autonomous Agent' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("⚡ CRON: Waking up to intelligently map a new city...");

  try {
    // 1. Get all currently mapped cities so the AI doesn't duplicate work
    const { data: currentVets } = await supabase.from('vets').select('city, state');
    
    // Create a unique set of "City, State" strings
    const uniqueLocations = [...new Set((currentVets || []).map(v => `${v.city}, ${v.state}`))];
    const locationString = uniqueLocations.length > 0 ? uniqueLocations.join(" | ") : "None yet";

    // 2. Ask GPT-4o to act as a strategic business director and pick the best missing city
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are the strategic director of expansion for a US veterinary directory. Output strictly raw JSON. No markdown." },
          { role: "user", content: `Here is the list of US cities our directory currently covers: [${locationString}]. 
Pick exactly ONE major, highly-populated US city that is NOT on this list. 
Return your choice strictly as a JSON object with a "target" key combining the city and state abbreviation (e.g., {"target": "Seattle, WA"}).` }
        ],
        temperature: 0.7 
      })
    });

    const data = await aiResponse.json();
    let rawJsonContent = data.choices[0].message.content.trim();
    if (rawJsonContent.startsWith('```json')) {
      rawJsonContent = rawJsonContent.replace(/^```json/, '').replace(/```$/, '').trim();
    }

    const aiDecision = JSON.parse(rawJsonContent);
    const targetLocation = aiDecision.target;

    if (!targetLocation) {
        throw new Error("AI failed to output a target location.");
    }

    await sendTelegramMessage(`🤖 <b>EXPANSION ROUTINE INITIATED</b> 🤖\nAI Strategic Director selected: <b>${targetLocation}</b>.\nDeploying Market Scraper...`);

    // 3. Trigger the actual Market Expansion web scraper
    // We use the absolute URL to call our own API route natively
    const baseUrl = new URL(request.url).origin;
    const scraperResponse = await fetch(`${baseUrl}/api/agents/enrich?location=${encodeURIComponent(targetLocation)}&secret=${process.env.AGENT_SECRET_KEY}`);
    
    const scrapeData = await scraperResponse.json();
    
    if (!scraperResponse.ok) {
       throw new Error(scrapeData.error || "Scraper crashed");
    }

    return NextResponse.json({ 
        success: true, 
        mission: targetLocation,
        scraper_result: scrapeData
    });

  } catch (error) {
    console.error("Expansion agent failed:", error);
    await sendTelegramMessage(`⚠️ <b>CRON BOT ALERT</b> ⚠️\nDaily Expansion Planner crashed.\nError: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
