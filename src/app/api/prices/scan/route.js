import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('bill');
    if (!file) {
      return NextResponse.json({ error: "No image found." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert veterinary auditor OCR. Read the uploaded veterinary bill/receipt. Identify the total out-of-pocket amount paid by the consumer. Second, identify what the primary procedure was and classify it as exactly one of these strings: ['Wellness Exam', 'Vaccines', 'Spay / Neuter', 'Dental Cleaning', 'Euthanasia', 'Emergency Room Exam']. If you cannot determine the exact procedure, return null. Return STRICTLY JSON with keys: \"cost\" (number), \"procedure\" (string or null), \"reasoning\" (brief explanation)."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Parse this bill and tell me the total cost and what the procedure was." },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
            ]
          }
        ],
        temperature: 0.1
      })
    });

    const data = await aiResponse.json();
    
    if (data.error) throw new Error(data.error.message);

    let rawJsonContent = data.choices[0].message.content.trim();
    if (rawJsonContent.startsWith('```json')) {
      rawJsonContent = rawJsonContent.replace(/^```json/, '').replace(/```$/, '').trim();
    }
    
    // Fallback cleanup if GPT somehow still wraps it in backticks
    if (rawJsonContent.startsWith('```')) {
        rawJsonContent = rawJsonContent.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(rawJsonContent);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("OCR Scan Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
