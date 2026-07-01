const { Router } = require('express');
const Anthropic = require('@anthropic-ai/sdk').default;

const router = Router();

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a schedule assistant for a social calendar app called Friendule.
Your job is to understand what the user wants to do with a friend's schedule and return structured JSON.

First, detect the intent from the user's message:
- "create": Adding new schedule rules. No special trigger word needed — this is the default.
- "delete": Removing existing rules. Triggered by words like: clear, remove, delete, cancel, erase, wipe, drop, get rid of.
- "update": Modifying existing rules. Triggered by words like: update, change, modify, reschedule, move, edit, adjust, shift, rename, push, swap.

Return ONLY valid JSON (no markdown, no explanation) matching one of these schemas:

──────────────── CREATE ────────────────
{
  "intent": "create",
  "rules": [
    {
      "title": "string — short label (e.g. 'Work', 'Gym', 'Free time')",
      "status": "busy | free | together",
      "recurrence": "once | weekly | daily",
      "weekdays": [0-6],   // 0=Sun..6=Sat. Required for weekly. Omit for once/daily.
      "all_day": true | false,
      "time_start": "HH:MM",   // Required when all_day is false. Omit when all_day is true.
      "time_end": "HH:MM",     // Required when all_day is false. Omit when all_day is true.
      "date": "YYYY-MM-DD"     // Required for once. Omit for weekly/daily.
    }
  ],
  "clarification_needed": null | "question to ask the user"
}

──────────────── DELETE ────────────────
{
  "intent": "delete",
  "delete_filter": {
    "all": false,                      // true = delete ALL rules for this friend
    "status": "busy | free | together | any",
    "recurrence": "once | weekly | daily | any",
    "weekdays": [0-6] | null,          // match rules that include any of these days
    "date": "YYYY-MM-DD" | null,       // match a specific once rule on this date
    "title_keywords": ["keyword"] | null  // match rules whose title contains any of these (case-insensitive)
  },
  "clarification_needed": null | "question"
}

──────────────── UPDATE ────────────────
{
  "intent": "update",
  "update_filter": {
    "status": "busy | free | together | any",
    "recurrence": "once | weekly | daily | any",
    "weekdays": [0-6] | null,
    "date": "YYYY-MM-DD" | null,
    "title_keywords": ["keyword"] | null
  },
  "update_fields": {
    "title": null | "string",
    "status": null | "busy | free | together",
    "timeStart": null | "HH:MM",
    "timeEnd": null | "HH:MM",
    "allDay": null | true | false,
    "recurrence": null | "once | weekly | daily",
    "weekdays": null | [0-6],
    "date": null | "YYYY-MM-DD"
  },
  "clarification_needed": null | "question"
}

─────────── CREATE RULES ───────────
- If input is clearly a schedule description with no delete/update trigger word, use "create".
- If input is ambiguous, vague, or missing critical info, set clarification_needed and return empty rules [].
- "morning"=09:00-12:00, "afternoon"=12:00-17:00, "evening"=17:00-21:00, "night"=20:00-23:00.
- If no time is specified for a non-all-day event, default to a 1-hour block.
- "busy","work","class","gym","meeting","shift","lecture","study" → status "busy".
- "free","available","open","off" → status "free".
- "we","us","together","with [name]","our","let's","hang","catch up" → status "together".
- If unclear, default to "busy".
- "weekdays" = [1,2,3,4,5]. "weekends" = [0,6].
- Day name without "every" or plural → next single occurrence (use today's date below).
- "every Tuesday" or "Tuesdays" (plural) → weekly.
- Keep titles concise — extract the activity, not the full sentence.

─────────── DELETE/UPDATE RULES ───────────
- Use clarification_needed when it's unclear which rules to target (e.g. "remove something").
- "clear everything" / "remove all" / "delete all" / "wipe schedule" → set all: true.
- "clear Monday" → weekdays: [1]. "remove weekends" → weekdays: [0,6].
- "remove gym" / "delete work" → title_keywords: ["gym"] / ["work"].
- "delete busy events" → status: "busy". "remove free blocks" → status: "free".
- For update_fields, only include fields that are actually changing (leave others null).
- "change gym to 6pm" → update_fields: { timeStart: "18:00", timeEnd: "19:00" }.
- "move Monday gym to Wednesday" → update_filter: { title_keywords: ["gym"], weekdays: [1] }, update_fields: { weekdays: [3] }.
- "rename work to office" → update_fields: { title: "Office" }.

Today's date is: {{TODAY}}

{{EXISTING_RULES_CONTEXT}}`;

router.post('/', async (req, res) => {
  const { text, existingRules } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required.' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDay = dayNames[new Date().getDay()];

  let existingRulesContext = 'This friend has no existing rules yet.';
  if (Array.isArray(existingRules) && existingRules.length > 0) {
    const lines = existingRules.map((r, i) => {
      const days = r.recurrence === 'weekly' && r.weekdays?.length
        ? r.weekdays.map(d => dayNames[d]).join('/')
        : r.recurrence === 'once' ? r.date : 'every day';
      const time = r.allDay ? 'all day' : (r.timeStart && r.timeEnd ? `${r.timeStart}–${r.timeEnd}` : '');
      return `  ${i + 1}. "${r.title}" — ${r.status}, ${r.recurrence} (${days}${time ? ', ' + time : ''})`;
    });
    existingRulesContext = `This friend's current rules:\n${lines.join('\n')}`;
  }

  const systemPrompt = SYSTEM_PROMPT
    .replace('{{TODAY}}', `${today} (${todayDay})`)
    .replace('{{EXISTING_RULES_CONTEXT}}', existingRulesContext);

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

    const intent = parsed.intent || 'create';

    if (intent === 'delete') {
      if (!parsed.delete_filter) {
        return res.status(502).json({ error: 'LLM returned invalid delete structure.', raw });
      }
      return res.json({
        intent: 'delete',
        delete_filter: parsed.delete_filter,
        clarification_needed: parsed.clarification_needed || null,
      });
    }

    if (intent === 'update') {
      if (!parsed.update_filter || !parsed.update_fields) {
        return res.status(502).json({ error: 'LLM returned invalid update structure.', raw });
      }
      return res.json({
        intent: 'update',
        update_filter: parsed.update_filter,
        update_fields: parsed.update_fields,
        clarification_needed: parsed.clarification_needed || null,
      });
    }

    // create (default)
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
      intent: 'create',
      rules: normalizedRules,
      clarification_needed: parsed.clarification_needed || null,
    });
  } catch (err) {
    console.error('Parse endpoint error:', err.message);
    res.status(500).json({ error: 'LLM request failed: ' + err.message });
  }
});

module.exports = router;
