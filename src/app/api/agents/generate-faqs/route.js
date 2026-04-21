import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("🤖 Autonomous Routine: Scanning for missing FAQ banks...");

  // 1. Find procedures that do NOT have an FAQ bank generated yet.
  const { data: procedures, error } = await supabaseAdmin
    .from('procedures')
    .select('id, name')
    .is('faq_bank', null);

  if (error || !procedures || procedures.length === 0) {
    return NextResponse.json({ message: "All procedures already have FAQ banks populated! Agent shutting down." });
  }

  const generatedList = [];

  for (const proc of procedures) {
    console.log(`🧠 Generating medically-accurate Spintax for: ${proc.name}...`);
    
    // Using gpt-4o for maximum medical accuracy!
    const prompt = `You are a licensed veterinary pricing coordinator. You are constructing a programmatic SEO spintax bank for the procedure: "${proc.name}".
Write EXACTLY 15 unique, medically accurate Frequently Asked Questions and their Answers regarding ${proc.name}.

The user's Next.js application will dynamically inject the City and State variables into your text. 
Therefore, you MUST use the exact string \${cityName} and \${stateCode} whenever you refer to the local area, and \${procedureName} when referring to the procedure.

Focus on costs, hidden fees, recovery expectations, local availability, low-cost alternatives, and insurance for ${proc.name}.

Return EXACTLY and strictly a JSON array of objects with "q" and "a" keys. No markdown blocks, just raw JSON.
Example format:
[
  { "q": "Are there hidden fees when booking \${procedureName} in \${cityName}?", "a": "In \${stateCode}, \${procedureName} quotes often exclude pre-surgical labs..." }
]`;

    try {
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You output only pure, raw JSON arrays." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2 // keep it highly factual
        })
      });

      const data = await aiResponse.json();
      let rawJsonContent = data.choices[0].message.content.trim();
      if (rawJsonContent.startsWith('\`\`\`json')) {
        rawJsonContent = rawJsonContent.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
      }

      const faqBankArray = JSON.parse(rawJsonContent);

      // Verify the array structure
      if (Array.isArray(faqBankArray) && faqBankArray.length > 5) {
        await supabaseAdmin
          .from('procedures')
          .update({ faq_bank: faqBankArray })
          .eq('id', proc.id);
        
        generatedList.push(proc.name);
      }
    } catch (e) {
      console.error(`Failed to generate bank for ${proc.name}`, e.message);
    }
  }

  return NextResponse.json({ 
    success: true, 
    message: "Autonomous generation complete.", 
    updated_procedures: generatedList 
  });
}
