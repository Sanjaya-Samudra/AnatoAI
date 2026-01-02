import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const { messages, selectedPart } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    // Mock response if no API key
    if (!apiKey) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return NextResponse.json({
        role: 'assistant',
        content: `**[MOCK MODE - No Groq API Key]**
        
I see you have selected the **${selectedPart}**. 

Since I am running in mock mode, I can tell you that common issues here include muscle strain or inflammation. 

*To get real AI insights, please add a valid GROQ_API_KEY to your .env.local file.*`
      });
    }

    const groq = new Groq({ apiKey });

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    
    // Construct a prompt that includes context
    const systemPrompt = `
      You are an advanced medical AI assistant for a 3D health application.
      The user has selected the "${selectedPart}" on the 3D body model.
      
      Your goal is to provide helpful, accurate, and concise medical information related to this body part.
      If the user describes symptoms, offer potential causes and general advice, but ALWAYS include a disclaimer.
      
      Tone: Professional, empathetic, and clear.
      Format: Use Markdown for readability (bullet points, bold text).
      
      Disclaimer: "I am an AI assistant, not a doctor. Please consult a healthcare professional for accurate diagnosis and treatment."
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    return NextResponse.json({
      role: 'assistant',
      content: text
    });

  } catch (error: unknown) {
    console.error('Error in chat route:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorStatus = (error as any)?.status;

    // Handle Rate Limit (429) specifically
    if (errorMessage.includes('429') || errorStatus === 429) {
       return NextResponse.json({
        role: 'assistant',
        content: "**(System)**: The AI service is currently busy (Rate Limit Exceeded). Please wait a minute and try again."
      });
    }

    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
