import { DateTime } from 'luxon';

/**
 * Expand schedule rules into concrete per-day intervals for a date range.
 *
 * Each rule is stored in the friend's IANA timezone. We iterate calendar days
 * in that zone, check if the rule fires, then convert the resulting interval
 * to the viewer's zone so the UI can render it as local minutes-since-midnight.
 *
 * @param {Array}  rules       - schedule rule objects
 * @param {string} friendZone  - IANA zone the rule times are expressed in (e.g. 'Europe/London')
 * @param {string} viewerZone  - IANA zone of the person viewing the calendar
 * @param {string} rangeStart  - ISO date 'YYYY-MM-DD' (inclusive, in viewer zone)
 * @param {string} rangeEnd    - ISO date 'YYYY-MM-DD' (inclusive, in viewer zone)
 * @returns {Array} concrete interval objects compatible with the calendar views
 */
export function expandRules(rules, friendZone, viewerZone, rangeStart, rangeEnd) {
  const intervals = [];

  // We iterate days in the FRIEND's zone so weekday checks are correct for them.
  // But we also need to cover days that might spill into the viewer's visible range
  // due to offset differences, so we pad by 1 day on each side.
  let cursor = DateTime.fromISO(rangeStart, { zone: viewerZone }).setZone(friendZone).startOf('day').minus({ days: 1 });
  const end = DateTime.fromISO(rangeEnd, { zone: viewerZone }).setZone(friendZone).endOf('day').plus({ days: 1 });

  while (cursor <= end) {
    const friendDate = cursor.toISODate();          // YYYY-MM-DD in friend's zone
    const friendWeekday = cursor.weekday % 7;       // Luxon weekday: 1=Mon..7=Sun → convert to 0=Sun convention

    for (const rule of rules) {
      if (!matchesDay(rule, friendDate, friendWeekday)) continue;

      const interval = buildInterval(rule, cursor, friendZone, viewerZone);
      if (!interval) continue;

      // Only include if the interval's viewer-side date falls within the requested range
      if (interval.date >= rangeStart && interval.date <= rangeEnd) {
        intervals.push(interval);
      }
    }

    cursor = cursor.plus({ days: 1 });
  }

  return intervals.sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 :
    (a.allDay ? -1 : 0) - (b.allDay ? -1 : 0) ||
    (a.startMin || 0) - (b.startMin || 0)
  );
}

function matchesDay(rule, isoDate, weekdaySun) {
  switch (rule.recurrence) {
    case 'once':
      return rule.date === isoDate;
    case 'daily':
      return true;
    case 'weekly':
      return rule.weekdays && rule.weekdays.includes(weekdaySun);
    default:
      return false;
  }
}

/**
 * Build a concrete interval object from a rule firing on a specific day.
 */
function buildInterval(rule, friendDayStart, friendZone, viewerZone) {
  const id = rule.id + '_' + friendDayStart.toISODate();

  if (rule.allDay) {
    // All-day events: express as the date in the viewer's zone corresponding
    // to the middle of the friend's day
    const midday = friendDayStart.set({ hour: 12 });
    const viewerMidDay = midday.setZone(viewerZone);
    return {
      id,
      ruleId: rule.id,
      friendId: rule.friendId,
      title: rule.title,
      status: rule.status,
      allDay: true,
      startMin: null,
      endMin: null,
      date: viewerMidDay.toISODate(),
      isoStart: friendDayStart.toISO(),
      isoEnd: friendDayStart.plus({ days: 1 }).toISO(),
    };
  }

  // Timed event: build start/end in friend's zone, convert to viewer's zone
  const [sh, sm] = rule.timeStart.split(':').map(Number);
  const [eh, em] = rule.timeEnd.split(':').map(Number);

  const friendStart = friendDayStart.set({ hour: sh, minute: sm, second: 0, millisecond: 0 });
  const friendEnd   = friendDayStart.set({ hour: eh, minute: em, second: 0, millisecond: 0 });

  const viewerStart = friendStart.setZone(viewerZone);
  const viewerEnd   = friendEnd.setZone(viewerZone);

  const viewerDate = viewerStart.toISODate();
  const startMin = viewerStart.hour * 60 + viewerStart.minute;
  const endMin   = viewerEnd.hour * 60 + viewerEnd.minute;

  return {
    id,
    ruleId: rule.id,
    friendId: rule.friendId,
    title: rule.title,
    status: rule.status,
    allDay: false,
    startMin,
    endMin: endMin <= startMin ? 1439 : endMin,   // cap at 23:59 if crosses midnight
    date: viewerDate,
    isoStart: viewerStart.toISO(),
    isoEnd: viewerEnd.toISO(),
  };
}

/**
 * Get the viewer's IANA timezone from the browser.
 */
export function getViewerZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
