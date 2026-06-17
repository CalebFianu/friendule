import { ymd, addDays, WEEKDAYS, fmtTime, prettyDate } from './dateUtils';

const WEEK_MAP = {
  sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3, weds: 3, thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5, saturday: 6, sat: 6
};

function pt(tok) {
  tok = tok.trim().toLowerCase();
  if (tok === 'noon') return { min: 720, mer: true };
  if (tok === 'midnight') return { min: 0, mer: true };
  const m = tok.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?\.?$/);
  if (!m) return null;
  let h = +m[1], mm = m[2] ? +m[2] : 0;
  const mer = m[3] ? m[3][0] : null;
  if (h > 23) return null;
  if (mer) { if (mer === 'p' && h < 12) h += 12; if (mer === 'a' && h === 12) h = 0; }
  return { min: h * 60 + mm, mer: !!mer };
}

function nextWeekday(wd) {
  const t = new Date();
  for (let i = 0; i < 14; i++) {
    const d = addDays(t, i);
    if (d.getDay() === wd) return ymd(d);
  }
  return ymd(t);
}

function cleanTitle(text, status) {
  let s = ' ' + text.toLowerCase() + ' ';
  s = s.replace(/\b(from|at|to|until|till|til|on the|on|every|each|weekly|this|next)\b/g, ' ');
  s = s.replace(/\d{1,2}(:\d{2})?\s*(am|pm|a|p)?/g, ' ');
  s = s.replace(/\ball[\s-]?day\b/g, ' ');
  s = s.replace(/\b(sun(days?)?|mon(days?)?|tue(s|sdays?)?|wed(nesdays?|s)?|thu(r|rs|rsdays?)?|fri(days?)?|sat(urdays?)?)\b/g, ' ');
  s = s.replace(/\b(weekdays?|weekends?|everyday|daily|today|tonight|tomorrow|weekend)\b/g, ' ');
  s = s.replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\b/g, ' ');
  s = s.replace(/\b(busy|free|available|open|off|noon|midnight|morning|afternoon|evening|night|and|amp)\b/g, ' ');
  s = s.replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (s.length < 2) return status === 'free' ? 'Free time' : 'Busy';
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

export function parseSchedule(text) {
  if (!text || !text.trim()) return { events: [], ok: false };
  const t = ' ' + text.toLowerCase().trim() + ' ';
  const hasFree = /\b(free|available|open|off)\b/.test(t);
  const hasBusy = /\b(busy|work|working|booked|unavailable|class|classes|lecture|shift|meeting|gym|practice|appointment|study|call)\b/.test(t);
  const status = hasFree && !hasBusy ? 'free' : 'busy';

  let startMin = null, endMin = null, allDay = false;
  if (/\ball[\s-]?day\b/.test(t)) allDay = true;
  const periods = { morning: [540, 720], afternoon: [720, 1020], evening: [1020, 1260], night: [1200, 1380] };
  const rm = t.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|a|p)?|noon|midnight)\s*(?:-|–|—|to|until|till|til|thru)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm|a|p)?|noon|midnight)/);
  if (rm) {
    const a = pt(rm[1]), b = pt(rm[2]);
    if (a && b) {
      if (!a.mer && b.mer && b.min >= 720 && (a.min + 720) <= b.min) a.min += 720;
      if (!b.mer && b.min <= a.min) b.min += 720;
      startMin = a.min; endMin = b.min;
    }
  } else {
    const sm = t.match(/\b(?:at\s*)?(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/) || t.match(/\bat\s+(\d{1,2}(?::\d{2})?)\b/);
    if (/\bnoon\b/.test(t)) { startMin = 720; endMin = 780; }
    else if (/\bmidnight\b/.test(t)) { startMin = 0; endMin = 60; }
    else if (sm) { const a = pt(sm[1]); if (a) { startMin = a.min; endMin = Math.min(a.min + 60, 1439); } }
    else { for (const k in periods) { if (new RegExp('\\b' + k + '\\b').test(t)) { startMin = periods[k][0]; endMin = periods[k][1]; break; } } }
  }
  if (startMin == null && !allDay) allDay = true;

  let weekdays = [], dates = [], recurring = false;
  if (/\b(weekdays?|workdays?)\b/.test(t)) { weekdays = [1, 2, 3, 4, 5]; recurring = true; }
  const weekendPhrase = /\b(this|next)\s+weekend\b/.test(t);
  if (/\bweekends?\b/.test(t) && !weekendPhrase) { weekdays = weekdays.concat([0, 6]); recurring = true; }
  if (/\b(every ?day|everyday|daily|each day)\b/.test(t)) { weekdays = [0, 1, 2, 3, 4, 5, 6]; recurring = true; }
  const dre = /\b(sundays?|mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sun|mon|tue|tues|wed|weds|thu|thur|thurs|fri|sat)\b/g;
  const names = [...t.matchAll(dre)].map(m => m[1]);
  if (names.length) {
    const recWord = /\b(every|each|weekly)\b/.test(t);
    const plural = names.some(x => /s$/.test(x) && x.length > 3);
    const wd = [...new Set(names.map(x => { const k = x.replace(/s$/, ''); return WEEK_MAP[k] != null ? WEEK_MAP[k] : WEEK_MAP[x]; }).filter(v => v != null))];
    if (recWord || plural || wd.length > 1) { weekdays = [...new Set(weekdays.concat(wd))]; recurring = true; }
    else if (wd.length === 1) { dates.push(nextWeekday(wd[0])); }
  }
  const now = new Date();
  if (/\b(today|tonight)\b/.test(t)) dates.push(ymd(now));
  if (/\btomorrow\b/.test(t)) dates.push(ymd(addDays(now, 1)));
  if (weekendPhrase) { dates.push(nextWeekday(6), nextWeekday(0)); }
  const MO = { january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11, jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
  const dm = t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (dm) { const mo = MO[dm[1]]; const dd = +dm[2]; let dt = new Date(now.getFullYear(), mo, dd); if (dt < addDays(now, -1)) dt = new Date(now.getFullYear() + 1, mo, dd); dates.push(ymd(dt)); }
  const sl = t.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  if (sl) { dates.push(ymd(new Date(now.getFullYear(), +sl[1] - 1, +sl[2]))); }
  if (!dm) { const ord = t.match(/\bon the (\d{1,2})(?:st|nd|rd|th)?\b/); if (ord) { const dd = +ord[1]; let dt = new Date(now.getFullYear(), now.getMonth(), dd); if (dt < addDays(now, -1)) dt = new Date(now.getFullYear(), now.getMonth() + 1, dd); dates.push(ymd(dt)); } }

  const title = cleanTitle(text, status);
  const base = { title, status, allDay, startMin: allDay ? null : startMin, endMin: allDay ? null : endMin };
  const events = [];
  if (recurring && weekdays.length) events.push({ ...base, type: 'weekly', weekdays: [...new Set(weekdays)].sort((a, b) => a - b) });
  [...new Set(dates)].forEach(d => events.push({ ...base, type: 'single', date: d }));
  if (!events.length) events.push({ ...base, type: 'single', date: ymd(now) });
  return { events, ok: true };
}

export function summarize(events) {
  if (!events.length) return '';
  const parts = events.slice(0, 2).map(e => {
    const when = e.type === 'weekly' ? e.weekdays.map(w => WEEKDAYS[w]).join(', ') : prettyDate(e.date);
    const time = e.allDay ? 'all day' : fmtTime(e.startMin) + '–' + fmtTime(e.endMin);
    return (e.status === 'free' ? 'free · ' : 'busy · ') + when + ' · ' + time;
  });
  return parts.join('   •   ') + (events.length > 2 ? '  +' + (events.length - 2) + ' more' : '');
}
