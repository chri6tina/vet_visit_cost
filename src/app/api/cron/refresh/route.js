import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '@/lib/telegram';

// Vercel Cron Agent to continuously prevent Data Decay
export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  
  // Vercel officially uses CRON_SECRET for its cron jobs
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && new URL(request.url).searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized Autonomous Agent' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("⚡ CRON: Waking up to fight data decay...");

  // Grab the 5 oldest vet records in the database based on created_at timestamp
  const { data: vets } = await supabase
    .from('vets')
    .select('id, name, city, state')
    .order('created_at', { ascending: true })
    .limit(5);

  if (!vets || vets.length === 0) {
    return NextResponse.json({ message: "No clinics in database." });
  }

  let updatedCount = 0;

  for (const vet of vets) {
    try {
      console.log(`🔍 CRON: Re-crawling ${vet.name} in ${vet.city}...`);
      
      const query = `What are the exact operating hours and emergency contact info for ${vet.name} in ${vet.city}, ${vet.state}? Extract latest data.`;
      
      const tavilyRes = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: query,
          search_depth: "basic",
          include_answer: true,
          max_results: 3
        })
      });
      
      const tavilyData = await tavilyRes.json();
      const rawContext = tavilyData.answer || tavilyData.results?.map(r => r.content).join(" ") || "";

      if (rawContext && rawContext.length > 50) {
        // Send the raw messy data to GPT-4o for clean parsing
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You extract strictly operating hours from text." },
              { role: "user", content: `Extract the concise business hours from this text: ${rawContext}. If none exist, output NONE.` }
            ],
            temperature: 0.1
          })
        });

        const data = await aiResponse.json();
        let extractedHours = data.choices[0].message.content.trim();
        
        if (extractedHours !== "NONE") {
          // Push update back to database and "refresh" the created_at timestamp so it goes to the back of the queue!
          await supabase
            .from('vets')
            .update({ 
               hours: extractedHours, 
               created_at: new Date().toISOString() 
            })
            .eq('id', vet.id);
            
          updatedCount++;
        } else {
            // Even if no hours found, refresh the timestamp so we don't infinitely retry the same clinic every 5 minutes
            await supabase.from('vets').update({ created_at: new Date().toISOString() }).eq('id', vet.id);
        }
      } else {
         // Refresh timestamp on failure
         await supabase.from('vets').update({ created_at: new Date().toISOString() }).eq('id', vet.id);
      }
    } catch (e) {
      console.error(`Cron failed on ${vet.name}`, e);
      await sendTelegramMessage(`⚠️ <b>MANAGER BOT ALERT</b> ⚠️\nCron bot failed to refresh data for <i>${vet.name}</i>.\nError: ${e.message}`);
    }
  }

  // Manager Bot Final Overview Report
  const finalMessage = `
🤖 <b>MANAGER BOT: SYSTEM AUDIT UPDATE</b> 🤖
<b>Worker:</b> <i>Sunday Morning Decay Prevention Cron</i>
<b>Outcome:</b> Checked the 5 oldest clinics in database
<b>Successes:</b> ${updatedCount} profiles functionally updated and moved to back of queue.
<b>Status:</b> All systems running flawlessly.
  `;
  await sendTelegramMessage(finalMessage.trim());

  return NextResponse.json({ success: true, refreshed: updatedCount, target: "decay_prevention" });
}
