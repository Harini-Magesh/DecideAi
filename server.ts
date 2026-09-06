import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client
function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in the environment variables.');
  }
  return new GoogleGenAI({ apiKey });
}

// Resilient generation with model fallback in case of transient 503 capacity spikes
async function generateContentWithFallback(ai: GoogleGenAI, configPayload: any) {
  const models = ['gemini-3.8-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    try {
      return await ai.models.generateContent({
        ...configPayload,
        model,
      });
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} unavailable (${err?.status || err?.message}), attempting fallback...`);
    }
  }
  throw lastError;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Chat endpoint for general-purpose conversational assistant + DecideAI thinking companion
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, mode, context } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getAIClient();

    const baseSystemInstruction = `
You are DecideAI, an intelligent, versatile, and high-clarity conversational AI assistant powered by Gemini.

CORE CAPABILITIES & SCOPE:
1. You function as a comprehensive, general-purpose conversational assistant. Users can ask questions about ANY legitimate topic, including:
   - Education, career paths, and professional growth
   - Business, entrepreneurship, finance, and strategy
   - Technology, programming, software architecture, and AI
   - Personal productivity, time management, and habits
   - Brainstorming creative ideas and concepts
   - General knowledge, science, history, and humanities
   - Problem solving, logic, and analytical breakdowns
   - Decisions, dilemmas, criteria, and trade-offs
   - Personal reflections, hindsight, and emotional clarity

DIRECT ANSWERING PRINCIPLE (CRITICAL):
2. Always directly answer the user's question when a direct answer is appropriate.
   - If the user asks a factual, technical, explanatory, informational, or how-to question, provide a clear, accurate, and direct response immediately.
   - NEVER deflect or respond solely with a follow-up question when the user asked for information or an answer.
   - Do NOT force every conversation into a decision-making workflow.

DECIDEAI THINKING DEPTH (FOR DECISIONS, IDEAS & REFLECTIONS):
3. When the user is facing a decision, exploring an idea, or processing a reflection:
   - Provide the signature DecideAI experience: explore viable options beyond binary choices, identify key factors, compare trade-offs, and respectfully challenge assumptions.
   - When appropriate, ask 1-2 thoughtful, focused follow-up questions to help them clarify their conviction.

MODE-SPECIFIC GUIDANCE (Current Mode: "${mode || 'decision'}"):
- DECISION MODE:
  * If the user describes a decision or dilemma: Directly address their situation, outline options, weigh the pros/cons/trade-offs, and suggest factors to consider. You may ask a targeted follow-up question to help them clarify what matters most.
  * If the user asks a general or informational question while in Decision Mode (e.g., "What is the difference between an LLC and a C-Corp?", "How does an index fund work?", "What does a CTO do?"): Answer the question thoroughly, accurately, and naturally first. If relevant to a decision context, you may smoothly add a brief note offering to help analyze their specific choice (e.g., "If you're currently deciding which structure fits your company, let me know and we can map out the trade-offs.").
- IDEA MODE:
  * If the user brings an idea or concept: Directly provide constructive feedback, brainstorm angles, explore feasibility, and highlight potential risks and the first concrete micro-test.
  * If the user asks general questions: Answer clearly and directly.
- REFLECTION MODE:
  * If the user shares an experience or feeling: Offer grounded, empathetic, non-judgmental perspectives and help extract lessons and wisdom.
  * If the user asks general questions: Answer clearly and directly.

CONVERSATION STYLE & BREVITY:
4. Keep responses concise, clear, and conversational by default. Avoid unnecessary fluff or repetitive disclaimers. Provide deeper detail whenever the topic requires it or when the user asks for more detail.
5. Use clean markdown formatting (bullet points, bold highlights) for readability.
6. Multi-turn awareness: Always maintain full context of previous messages in the dialogue.
`;

    // Format chat history for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await generateContentWithFallback(ai, {
      contents,
      config: {
        systemInstruction: `${baseSystemInstruction}\n${context ? `Additional user context: ${context}` : ''}`,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I am here to help. What would you like to explore or discuss?';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate companion response.',
    });
  }
});

// Decision Snapshot generator endpoint
app.post('/api/snapshot', async (req: Request, res: Response) => {
  try {
    const { messages, mode } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required to generate a snapshot.' });
    }

    const ai = getAIClient();

    const conversationTranscript = messages
      .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const prompt = `
Analyze the following conversation from DecideAI (${mode || 'decision'} mode) and produce a structured Decision Snapshot.
Synthesize the user's actual thoughts, options, factors, and insights uncovered during the dialogue.
If the conversation was a general discussion or learning session, synthesize the core topic, key concepts considered, main trade-offs or considerations, and recommended next step.

Transcript:
${conversationTranscript}

Return a valid JSON object matching this exact schema:
{
  "title": "A concise, meaningful title capturing the core decision or topic (max 6 words)",
  "whatIAmThinkingAbout": "A clear, focused summary of the core dilemma, decision, or concept in 1-3 sentences.",
  "optionsConsidered": ["Option 1 with brief nuance", "Option 2 with brief nuance", ...],
  "keyFactors": ["Factor 1 (e.g. financial security, work-life balance)", "Factor 2", ...],
  "mainTradeOffs": ["Trade-off 1: What is gained vs sacrificed", ...],
  "biggestConcern": "The primary underlying risk, anxiety, or obstacle the user faces.",
  "keyInsight": "The most pivotal realization, breakthrough, or mental clarity that emerged.",
  "suggestedNextStep": "A low-friction, concrete, immediate action step the user can take right now to advance their clarity."
}
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text || '{}';
    let snapshotData;
    try {
      snapshotData = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      snapshotData = JSON.parse(cleaned);
    }

    return res.json({ snapshot: snapshotData });
  } catch (error: any) {
    console.error('Error in /api/snapshot:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create Decision Snapshot.',
    });
  }
});

// Future Me Check-in reflection endpoint
app.post('/api/reflect', async (req: Request, res: Response) => {
  try {
    const { snapshot, messages, reflectionNotes } = req.body;

    const ai = getAIClient();

    const snapshotContext = snapshot
      ? `
ORIGINAL DECISION SNAPSHOT (Created on ${snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleDateString() : 'earlier'}):
Title: ${snapshot.title}
Original Dilemma: ${snapshot.whatIAmThinkingAbout}
Options Considered: ${snapshot.optionsConsidered?.join('; ')}
Key Factors: ${snapshot.keyFactors?.join('; ')}
Main Trade-offs: ${snapshot.mainTradeOffs?.join('; ')}
Biggest Concern at the time: ${snapshot.biggestConcern}
Key Insight: ${snapshot.keyInsight}
Suggested Next Step: ${snapshot.suggestedNextStep}
${reflectionNotes ? `User's Check-in Notes: ${reflectionNotes}` : ''}
`
      : 'No prior snapshot provided.';

    const systemInstruction = `
You are DecideAI facilitating a "Future Me Check-In" reflection.
The user previously worked through a major decision or idea and scheduled this future check-in to revisit it.
Snapshot details:
${snapshotContext}

Behavioral guidelines:
- If this is the start of the check-in conversation, always lead with or embody the theme:
  "A previous version of you wanted to revisit this decision. What has changed since then?"
- Directly answer any specific questions the user asks about their past decision or situation.
- Compare the original thought process and fears with their current perspective.
- Help them notice what turned out better than expected, what unexpected factors emerged, and what wisdom they gained.
- Encourage self-compassion: decisions are made with the information available at the time.
- Keep the tone calm, thoughtful, encouraging, and focused on learning.
`;

    const contents = (messages && messages.length > 0)
      ? messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }))
      : [
          {
            role: 'user',
            parts: [{ text: 'I am ready to check in on this past decision.' }],
          },
        ];

    const response = await generateContentWithFallback(ai, {
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    return res.json({
      reply:
        response.text ||
        'A previous version of you wanted to revisit this decision. What has changed since then? How did things unfold compared to what you anticipated?',
    });
  } catch (error: any) {
    console.error('Error in /api/reflect:', error);
    return res.status(500).json({
      error: error.message || 'Failed to run reflection check-in.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DecideAI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
