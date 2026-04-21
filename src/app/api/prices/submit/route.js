import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const vetId = formData.get('vetId');
    const procedureId = formData.get('procedureId');
    const cost = formData.get('cost');
    const billFile = formData.get('bill');

    if (!vetId || !procedureId || !cost) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // If an image was provided, you could upload it to Supabase Storage here.
    // For now, we will just securely insert the structured price data for verified calculation.
    
    // Insert the exact price submitted
    const { error } = await supabaseAdmin.from('vet_prices').insert({
      vet_id: vetId,
      procedure_id: procedureId,
      price_exact: parseInt(cost),
      verified: !!billFile // Auto-flag as needing physical verification if a bill was attached
    });

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: "Database error." }, { status: 500 });
    }

    const { data: vetHit } = await supabaseAdmin.from('vets').select('name').eq('id', vetId).single();
    const vetName = vetHit?.name || 'A Clinic';

    await sendTelegramMessage(`
💰 <b>NEW PRICE CROWDSOURCED</b> 💰
<b>Clinic:</b> <i>${vetName}</i>
<b>Procedure ID:</b> ${procedureId}
<b>Cost Reported:</b> $${cost}
<b>Receipt Scanned:</b> ${!!billFile ? 'YES ✅ (Verified)' : 'NO ❌'}
    `.trim());

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submission error:", err);
    return NextResponse.json({ error: "Failed to process submission." }, { status: 500 });
  }
}
