import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const KNOWLEDGE_BASE = `
Masdar City Knowledge Base & Key Information:
1. Freezone Setup:
- Masdar City Free Zone offers 100% foreign ownership, 0% import tariffs, cost-effective licensing, and dual-licensing options.
- Ideal for companies in clean tech, renewable energy, AI, and green businesses.
- Setup is quick and streamlined, taking typically 3-5 working days.

2. UAE Golden Visa:
- Investors, entrepreneurs, outstanding students, and specialized talents operating in Masdar City are eligible to apply for the 10-year UAE Golden Visa.
- Masdar City Free Zone provides visa processing assistance to streamline the application process.

3. Sustainable Real Estate:
- Masdar City offers premium LEED and Estidama-certified commercial and residential properties.
- Key commercial buildings include The Square, The Courtyard, and custom-built headquarters.
- Buildings feature approximately 40% lower energy and water consumption compared to standard structures.

4. Registration FAQs:
- Standard company registration takes 3-5 days.
- Required documents typically include a passport copy, a brief business plan, and proof of address.
- Masdar City offers a dedicated "One-Stop Shop" portal for all registration, licensing, and visa needs.
`;

const SYSTEM_INSTRUCTIONS = `Role & Persona:
You are the official AI Assistant for Masdar City and Masdar Freezone. You are professional, highly knowledgeable, welcoming, and deeply aligned with Masdar City's core values of sustainability, innovation, and technological advancement. Your primary goal is to assist entrepreneurs, investors, and professionals with information regarding business setup, freezone regulations, licensing, visas, and living/working in Masdar City.

Tone & Style:
* Be concise, clear, and action-oriented.
* Maintain a formal but approachable corporate tone.
* Structure your responses with clean markdown formatting. Use **bold** for key terms, bullet points for lists, and headings (##) to organize longer answers.

Knowledge Boundaries:
* Scope: You may only answer questions related to Masdar City, UAE Freezone company formation, UAE visas (Golden Visa, Freelance, Investor), commercial real estate in Masdar, and sustainability initiatives.
* Out of Scope: If a user asks about general world trivia, coding, or competitors (unless specifically comparing freezone benefits), politely decline and steer the conversation back to Masdar City services.
* Escalation: For highly specific pricing, complex legal cases, or when a user is ready to start their setup process, instruct them to speak with a human consultant using the "WhatsApp" or "Call Us" buttons on the interface. Do not invent pricing or legal guarantees.

${KNOWLEDGE_BASE}`;

let aiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!aiClient) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not set in environment variables");
    }
    aiClient = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey,
    });
  }
  return aiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "message" field' });
    }

    const client = getClient();

    // Map history from frontend format to OpenAI format
    const mappedHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = (history || []).map(
      (h: { role: string; parts: { text: string }[] }) => ({
        role: h.role === 'model' ? 'assistant' as const : 'user' as const,
        content: h.parts[0].text,
      })
    );

    const response = await client.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTIONS },
        ...mappedHistory,
        { role: 'user', content: message },
      ],
    });

    const content = response.choices[0]?.message?.content || '';

    return res.status(200).json({ response: content });
  } catch (error: any) {
    console.error('DeepSeek API error:', error);
    return res.status(500).json({ error: 'Failed to get response from AI assistant' });
  }
}
