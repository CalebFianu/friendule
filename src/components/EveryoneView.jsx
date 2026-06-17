import { buildGrid, MONTHS, WEEKDAYS, addDays, ymd, prettyDate } from '../utils/dateUtils';

function cellBaseStyle(c) {
  return {
    minHeight: '94px', background: c.inMonth ? '#fff' : '#FAF4ED',
    border: '1px solid ' + (c.isToday ? '#E69873' : '#EFE7DD'),
    borderRadius: '14px', padding: '7px 8px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: c.isToday ? '0 0 0 2px rgba(224,122,83,.16)' : 'none',
    opacity: c.inMonth ? 1 : .55, transition: 'border-color .15s'
  };
}

function numBadgeStyle(c) {
  return c.isToday
    ? { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '23px', height: '23px', padding: '0 5px', borderRadius: '999px', background: '#E07A53', color: '#fff', fontWeight: 800, fontSize: '13px', fontFamily: "'Quicksand',sans-serif" }
    : { fontWeight: 800, fontSize: '13px', color: c.inMonth ? '#5A4F45' : '#BCAFA2', padding: '0 3px', fontFamily: "'Quicksand',sans-serif" };
}

export default function EveryoneView({ cur, friends, everyoneFilter, busyOn, toggleEveryoneFilter, clearEveryoneFilter, prevPeriod, nextPeriod, goToday, openDay }) {
  const filterActive = everyoneFilter.length > 0;
  const filterFriends = filterActive ? friends.filter(fr => everyoneFilter.includes(fr.id)) : [];
  const filterNames = filterFriends.map(fr => fr.firstName);
  const everyoneFilterName = filterNames.length <= 2 ? filterNames.join(' & ') : filterNames.slice(0, -1).join(', ') + ' & ' + filterNames.slice(-1);

  // Insight
  let insightTitle = 'Best time to gather';
  let insightLabel = 'Everyone\u2019s pretty booked the next two weeks.';
  if (filterActive) {
    const allBusy = (y) => filterFriends.some(fr => busyOn(fr.id, y));
    let nf = null;
    for (let i = 0; i < 14; i++) { const d = addDays(new Date(), i); const y2 = ymd(d); if (!allBusy(y2)) { nf = y2; break; } }
    if (filterFriends.length === 1) {
      insightTitle = 'Next free for ' + everyoneFilterName;
      insightLabel = nf ? prettyDate(nf) + ' \u2014 ' + everyoneFilterName + ' is free' : everyoneFilterName + ' is booked the next two weeks.';
    } else {
      insightTitle = 'Best time for ' + everyoneFilterName;
      insightLabel = nf ? prettyDate(nf) + ' \u2014 all ' + filterFriends.length + ' are free' : 'No shared free days for ' + everyoneFilterName + ' in the next two weeks.';
    }
  } else {
    let best = null;
    for (let i = 0; i < 14; i++) {
      const d = addDays(new Date(), i); const y2 = ymd(d);
      const freeNames = friends.filter(fr => !busyOn(fr.id, y2)).map(fr => fr.firstName);
      if (!best || freeNames.length > best.count) best = { count: freeNames.length, y: y2, names: freeNames };
      if (best.count === friends.length) break;
    }
    if (best) {
      if (best.count === 0) insightLabel = 'No fully-free days soon \u2014 try the day view to find gaps.';
      else if (best.count === friends.length) insightLabel = prettyDate(best.y) + ' \u2014 all ' + friends.length + ' are free!';
      else insightLabel = prettyDate(best.y) + ' \u2014 ' + best.count + ' of ' + friends.length + ' free (' + best.names.join(', ') + ')';
    }
  }

  const grid = buildGrid(cur);
  const monthLabel = MONTHS[cur.getMonth()] + ' ' + cur.getFullYear();

  return (
    <div style={{ animation: 'flin .25s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
        <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: '23px' }}>Everyone &middot; {monthLabel}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button style={{ width: '36px', height: '36px', borderRadius: '999px', border: '1px solid #EFE7DD', background: '#fff', color: '#6B5E52', fontSize: '18px', cursor: 'pointer', fontWeight: 700 }} onClick={prevPeriod}>&lsaquo;</button>
          <button style={{ width: '36px', height: '36px', borderRadius: '999px', border: '1px solid #EFE7DD', background: '#fff', color: '#6B5E52', fontSize: '18px', cursor: 'pointer', fontWeight: 700 }} onClick={nextPeriod}>&rsaquo;</button>
          <button style={{ marginLeft: '2px', border: '1px solid #EFE7DD', background: '#fff', color: '#6B5E52', borderRadius: '999px', padding: '8px 14px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }} onClick={goToday}>Today</button>
        </div>
      </div>

      {/* Insight banner */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(118deg, oklch(0.72 0.13 48), oklch(0.66 0.155 27))', borderRadius: '22px', padding: '18px 22px', margin: '12px 0 18px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', boxShadow: '0 18px 38px -16px oklch(0.66 0.155 32 / .55)' }}>
        <div style={{ position: 'absolute', right: '-34px', top: '-46px', width: '170px', height: '170px', borderRadius: '999px', background: 'rgba(255,255,255,.13)' }} />
        <div style={{ position: 'absolute', right: '54px', bottom: '-66px', width: '128px', height: '128px', borderRadius: '999px', background: 'rgba(255,255,255,.08)' }} />
        <div style={{ position: 'relative', flex: '0 0 auto', width: '48px', height: '48px', borderRadius: '15px', background: 'rgba(255,255,255,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '23px', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.25)' }}>🌿</div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,.82)' }}>{insightTitle}</div>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: '19px', marginTop: '2px', color: '#fff', textWrap: 'pretty' }}>{insightLabel}</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
        {filterActive && (
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #E07A53', background: '#FFF3EA', color: '#C0563E', borderRadius: '999px', padding: '6px 14px', cursor: 'pointer', fontWeight: 800, fontSize: '13px' }} onClick={clearEveryoneFilter}>
            <span style={{ fontSize: '14px', lineHeight: 1 }}>✕</span>Showing {everyoneFilterName} &middot; Show all
          </button>
        )}
        {friends.map(fr => {
          const active = everyoneFilter.includes(fr.id);
          const dim = filterActive && !active;
          return (
            <button key={fr.id} onClick={() => toggleEveryoneFilter(fr.id)} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              border: '1px solid ' + (active ? fr.colorset.solid : '#EFE7DD'),
              background: active ? fr.colorset.tint : '#fff',
              borderRadius: '999px', padding: '6px 13px 6px 7px', cursor: 'pointer',
              fontWeight: 700, fontSize: '13px', color: active ? fr.colorset.deep : '#3A322C',
              boxShadow: active ? '0 8px 16px -7px ' + fr.colorset.solid : 'none',
              opacity: dim ? 0.55 : 1, transition: 'all .15s'
            }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '999px', background: fr.colorset.solid }} />{fr.firstName}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '8px' }}>
        {WEEKDAYS.map(wd => (
          <div key={wd} style={{ textAlign: 'center', fontSize: '11.5px', fontWeight: 800, color: '#A99C8F', textTransform: 'uppercase', letterSpacing: '.6px', paddingBottom: '2px' }}>{wd}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '8px', marginTop: '4px' }}>
        {grid.map(c => {
          const dots = [];
          let freeCount = 0, shown = 0;
          friends.forEach(fr => {
            if (filterActive && !everyoneFilter.includes(fr.id)) return;
            shown++;
            const busy = busyOn(fr.id, c.ymd);
            if (busy) dots.push({ name: fr.name, color: fr.colorset.solid, id: fr.id });
            else freeCount++;
          });
          const allFree = freeCount === shown;
          const freeLabel = c.inMonth && allFree ? (shown === 1 ? 'free' : 'all free') : '';
          return (
            <div key={c.ymd} style={cellBaseStyle(c)} onClick={() => openDay(c.ymd)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={numBadgeStyle(c)}>{c.day}</span>
                {freeLabel && <span style={{ fontSize: '10px', fontWeight: 800, color: '#5BA06B', background: '#EAF6EC', borderRadius: '999px', padding: '1px 6px' }}>{freeLabel}</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                {dots.map(dot => (
                  <span key={dot.id} style={{ width: '10px', height: '10px', borderRadius: '999px', background: dot.color, display: 'inline-block' }} title={dot.name} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
