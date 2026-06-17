export function pad(n) {
  return (n < 10 ? '0' : '') + n;
}

export function ymd(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

export function parseYmd(s) {
  const a = s.split('-').map(Number);
  return new Date(a[0], a[1] - 1, a[2]);
}

export function addDays(d, n) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function fmtTime(min) {
  if (min == null) return '';
  let h = Math.floor(min / 60), m = min % 60;
  const ap = h < 12 ? 'AM' : 'PM';
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return hh + (m ? ':' + pad(m) : '') + ' ' + ap;
}

export function shortTime(min) {
  if (min == null) return '';
  let h = Math.floor(min / 60), m = min % 60;
  const ap = h < 12 ? 'a' : 'p';
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return hh + (m ? ':' + pad(m) : '') + ap;
}

export function hhmm(min) {
  return pad(Math.floor(min / 60)) + ':' + pad(min % 60);
}

export function toMin(hhmmStr) {
  const a = (hhmmStr || '00:00').split(':').map(Number);
  return a[0] * 60 + (a[1] || 0);
}

export function prettyDate(y) {
  const d = parseYmd(y);
  return WEEKDAYS[d.getDay()] + ' ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
}

export function buildGrid(cur) {
  const first = new Date(cur.getFullYear(), cur.getMonth(), 1);
  const start = addDays(first, -first.getDay());
  const today = ymd(new Date());
  const a = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i);
    const y2 = ymd(d);
    a.push({
      date: d,
      ymd: y2,
      day: d.getDate(),
      inMonth: d.getMonth() === cur.getMonth(),
      isToday: y2 === today,
      weekday: d.getDay()
    });
  }
  return a;
}
