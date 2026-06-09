import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { RESUME_CONTEXT } from '@/lib/resume-context';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      // Mock response for demo without API key
      return NextResponse.json({
        response: `[Demo Mode] I'm an AI assistant for Jay Wani's portfolio. You asked: "${message}". 
        
Jay is a 3rd year B.Tech CSE student at KIT's College of Engineering, Kolhapur with a CGPA of 8.78. He specializes in Full Stack Development and AI/ML, particularly RAG pipelines and LLM integration. He has 2 internships, 3 live projects, and multiple achievements including winning the TECHFIESTA International Hackathon. He's currently open to remote internships!

Please add your GROQ_API_KEY to get real AI responses.`,
        tokens_used: 0,
      });
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: RESUME_CONTEXT,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 1024,
    });

    const responseText = response.choices[0]?.message?.content || 'I could not generate a response.';

    return NextResponse.json({
      response: responseText,
      tokens_used: response.usage?.total_tokens || 0,
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate response: ${errorMessage}` },
      { status: 500 }
    );
  }
}
