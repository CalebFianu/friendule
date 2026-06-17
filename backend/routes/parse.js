const { Router } = require('express');
const Anthropic = require('@anthropic-ai/sdk').default;

const router = Router();

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a schedule parser for a social calendar app called Friendule.
Your job is to convert natural-language descriptions of someone's schedule into structured JSON rules.

Return ONLY valid JSON matching this schema (no markdown, no explanation):

{
  "rules": [
    {
      "title": "string — short label for the block (e.g. 'Work', 'Gym', 'Free time')",
      "status": "'busy' | 'free' | 'together'",
      "recurrence": "'once' | 'weekly' | 'daily'",
      "weekdays": [0,1,2,3,4,5,6],  // 0=Sunday..6=Saturday. Required for 'weekly'. Omit for 'once'/'daily'.
      "all_day": true | false,
      "time_start": "HH:MM",  // 24-hour format. Required when all_day is false. Omit when all_day is true.
      "time_end": "HH:MM",    // 24-hour format. Required when all_day is false. Omit when all_day is true.
      "date": "YYYY-MM-DD"    // Required for 'once'. Omit for 'weekly'/'daily'.
    }
  ],
  "clarification_needed": null | "string question to ask the user"
}

Rules:
- If the input is clearly a schedule description, parse it into one or more rules.
- If the input is ambiguous, vague, or missing critical information (e.g. "busy sometimes", "free in the evenings sometimes", "maybe Tuesday"), set clarification_needed to a helpful question and return an empty rules array.
- "morning" = 09:00-12:00, "afternoon" = 12:00-17:00, "evening" = 17:00-21:00, "night" = 20:00-23:00.
- If no time is specified for a non-all-day event, default to a 1-hour block.
- Words like "busy", "work", "class", "gym", "meeting", "shift", "lecture", "study" imply status "busy".
- Words like "free", "available", "open", "off" imply status "free".
- Phrases that imply a shared activity with the friend — e.g. "we", "us", "together", "with [name]", "our", "let's", "hang", "catch up", "going to [place] with them" — imply status "together".
- If neither busy nor free nor together is clear, default to "busy".
- For "weekdays" use [1,2,3,4,5]. For "weekends" use [0,6].
- When the user says a day name without "every" or plural (e.g. "Tuesday"), treat it as a single occurrence on the next upcoming occurrence of that day. Use today's date (provided below) to calculate the exact date.
- When the user says "every Tuesday" or "Tuesdays" (plural), make it weekly.
- Keep titles concise — extract the activity name, not the full sentence.

Today's date is: {{TODAY}}`;

router.post('/', async (req, res) => {
  const { text } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required.' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDay = dayNames[new Date().getDay()];
  const systemPrompt = SYSTEM_PROMPT.replace('{{TODAY}}', `${today} (${todayDay})`);

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: text.trim() }],
    });

    const raw = message.content[0].text.trim();

    let parsed;
    try {
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ error: 'Failed to parse LLM response.', raw });
    }

    if (!parsed.rules || !Array.isArray(parsed.rules)) {
      return res.status(502).json({ error: 'LLM returned invalid structure.', raw });
    }

    const normalizedRules = parsed.rules.map(r => ({
      ...r,
      allDay: r.allDay ?? r.all_day ?? false,
      timeStart: r.timeStart ?? r.time_start ?? null,
      timeEnd: r.timeEnd ?? r.time_end ?? null,
    }));

    res.json({
      rules: normalizedRules,
      clarification_needed: parsed.clarification_needed || null,
    });
  } catch (err) {
    console.error('Parse endpoint error:', err.message);
    res.status(500).json({ error: 'LLM request failed: ' + err.message });
  }
});

module.exports = router;
