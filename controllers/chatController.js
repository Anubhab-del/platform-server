export const chat = async (req, res) => {
  console.log('=== CHAT REQUEST ===');
  console.log('User:', req.user?._id);
  console.log('GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
  console.log('GROQ_API_KEY preview:', process.env.GROQ_API_KEY?.slice(0, 15));

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Messages array is required.',
    });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    console.log('ERROR: No Groq API key found in environment');
    return res.status(500).json({
      success: false,
      message: 'Chat service is not configured. GROQ_API_KEY missing.',
    });
  }

  const systemPrompt = `You are LearnBot, an expert AI learning assistant for the LearnPro EdTech platform.
You help students with:
- Explaining concepts from their courses (Web Dev, Data Science, AI/ML, Design, etc.)
- Answering coding questions with clear examples
- Motivating and guiding students through their learning journey
- Study strategies, time management, and career advice in tech

Rules:
- Be concise, warm, and encouraging
- Use markdown formatting for code and key terms
- Keep responses under 300 words unless asked for more`;

  try {
    console.log('Calling Groq API...');

    const groqResponse = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    console.log('Groq response status:', groqResponse.status);

    const responseText = await groqResponse.text();
    console.log('Groq raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.log('Failed to parse Groq response as JSON');
      return res.status(500).json({
        success: false,
        message: 'Invalid response from AI service.',
      });
    }

    if (!groqResponse.ok) {
      console.log('Groq error:', data);
      return res.status(500).json({
        success: false,
        message: data?.error?.message || 'AI service error.',
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        success: false,
        message: 'No response from AI service.',
      });
    }

    console.log('Groq reply preview:', reply.slice(0, 50));

    res.json({ success: true, message: reply });

  } catch (err) {
    console.error('Chat controller error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to connect to AI service.',
    });
  }
};