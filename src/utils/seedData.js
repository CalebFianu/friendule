function mk(color) {
  return {
    solid: color,
    tint: `color-mix(in oklch, ${color} 15%, white)`,
    tintBorder: `color-mix(in oklch, ${color} 42%, white)`,
    deep: `color-mix(in oklch, ${color} 72%, #3a2a1a)`
  };
}

export const PALETTE = [
  'oklch(0.70 0.15 25)', 'oklch(0.74 0.14 65)', 'oklch(0.70 0.12 155)',
  'oklch(0.66 0.12 245)', 'oklch(0.64 0.15 320)', 'oklch(0.68 0.14 195)',
  'oklch(0.72 0.13 285)', 'oklch(0.71 0.13 110)'
];

export function makeColorset(color) {
  return mk(color);
}

export const DEFAULT_FRIENDS = [
  { id: 'maya', name: 'Maya Chen', initials: 'MC', color: 'oklch(0.70 0.15 25)', status: 'Freelance designer \u00b7 usually free evenings', timezone: 'Africa/Accra' },
  { id: 'leo', name: 'Leo Okafor', initials: 'LO', color: 'oklch(0.74 0.14 65)', status: 'Building a startup \u00b7 slammed on weekdays', timezone: 'Africa/Accra' },
  { id: 'priya', name: 'Priya Nair', initials: 'PN', color: 'oklch(0.70 0.12 155)', status: 'New parent \u00b7 small pockets of free time', timezone: 'Asia/Kolkata' },
  { id: 'sam', name: 'Sam Rivera', initials: 'SR', color: 'oklch(0.66 0.12 245)', status: 'Remote engineer \u00b7 flexible afternoons', timezone: 'America/New_York' },
  { id: 'tariq', name: 'Tariq Haddad', initials: 'TH', color: 'oklch(0.64 0.15 320)', status: 'Med student \u00b7 lives at the hospital', timezone: 'Europe/London' }
].map(f => ({ ...f, firstName: f.name.split(' ')[0], colorset: mk(f.color) }));

export function buildSeedRules() {
  let n = 0;
  const id = () => 'seed' + (n++);
  const W = (fid, wd, title, status, ts, te) => ({
    id: id(), friendId: fid, recurrence: 'weekly', weekdays: wd, title, status,
    allDay: ts == null, timeStart: ts, timeEnd: te,
  });
  return [
    W('maya', [1, 2, 3, 4, 5], 'Design work', 'busy', '09:00', '17:00'),
    W('maya', [2, 4], 'Yoga', 'busy', '18:00', '19:00'),
    W('maya', [6], 'Open day', 'free', null, null),
    W('maya', [0], 'Brunch run', 'busy', '11:00', '13:00'),
    W('leo', [1, 2, 3, 4, 5], 'Startup grind', 'busy', '08:00', '20:00'),
    W('leo', [1, 3, 5], 'Gym', 'busy', '07:00', '08:00'),
    W('leo', [0], 'Recharge', 'free', null, null),
    W('priya', [1, 2, 3, 4, 5], 'Baby duty', 'busy', null, null),
    W('priya', [1, 2, 3, 4, 5], 'Nap window', 'free', '13:00', '15:00'),
    W('priya', [3], 'Parent meetup', 'busy', '10:00', '12:00'),
    W('priya', [6], 'Family day', 'busy', '09:00', '18:00'),
    W('sam', [1, 2, 3, 4, 5], 'Standup', 'busy', '10:00', '10:30'),
    W('sam', [1, 3, 5], 'Open afternoon', 'free', '14:00', '18:00'),
    W('sam', [2, 4], 'Deep work', 'busy', '13:00', '17:00'),
    W('sam', [6], 'Climbing', 'busy', '09:00', '12:00'),
    W('tariq', [1, 3, 5], 'Lectures', 'busy', '09:00', '16:00'),
    W('tariq', [2, 4], 'Hospital shift', 'busy', '07:00', '19:00'),
    W('tariq', [0], 'Day off', 'free', null, null),
    W('tariq', [6], 'Study', 'busy', '10:00', '15:00')
  ];
}
