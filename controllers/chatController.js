// POST /api/chat
export const chat = async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Messages array is required.',
    });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({
      success: false,
      message: 'Chat service is not configured.',
    });
  }

  const systemPrompt = `You are LearnBot, an expert AI learning assistant for the LearnPro EdTech platform.
You help students with:
- Explaining concepts from their courses (Web Dev, Data Science, AI/ML, Design, etc.)
- Recommending what to study next based on their goals
- Answering coding questions with clear examples
- Motivating and guiding students through their learning journey
- Study strategies, time management, and career advice in tech

Rules:
- Be concise, warm, and encouraging
- Use markdown formatting: **bold** for key terms, \`code\` for code snippets, bullet points for lists
- When showing code examples, use fenced code blocks with the language specified
- Never make up course content that doesn't exist on the platform
- If unsure about something, say so honestly and suggest where they might find the answer
- Keep responses under 300 words unless the user explicitly asks for a detailed explanation`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      model:       'llama-3.3-70b-versatile',
      messages:    [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens:  1024,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return res.status(response.status).json({
      success: false,
      message: error.error?.message || 'Chat service error.',
    });
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || 'I could not generate a response. Please try again.';

  res.json({ success: true, message: reply });
};