import { buildGrid, MONTHS, WEEKDAYS, addDays, ymd, prettyDate } from '../utils/dateUtils';
import { IconButton } from './ds.jsx';

function cellStyle(c) {
  return {
    minHeight: '88px',
    background: c.inMonth ? 'var(--surface-card)' : 'var(--surface-sunken)',
    border: `1px solid ${c.isToday ? 'var(--accent)' : 'var(--border-subtle)'}`,
    borderRadius: 'var(--radius-md)',
    padding: '7px 8px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: c.isToday ? '0 0 0 2px var(--accent-wash)' : 'var(--shadow-xs)',
    opacity: c.inMonth ? 1 : 0.5,
    transition: 'border-color var(--dur-fast) var(--ease-out)',
  };
}

function dayNumStyle(c) {
  if (c.isToday) {
    return {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: '22px', height: '22px', padding: '0 4px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--accent)', color: '#fff',
      fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-xs)',
    };
  }
  return {
    fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-xs)',
    color: c.inMonth ? 'var(--text-secondary)' : 'var(--text-tertiary)', padding: '0 2px',
  };
}

export default function EveryoneView({ cur, friends, everyoneFilter, busyOn, toggleEveryoneFilter, clearEveryoneFilter, prevPeriod, nextPeriod, goToday, openDay }) {
  const filterActive  = everyoneFilter.length > 0;
  const filterFriends = filterActive ? friends.filter(fr => everyoneFilter.includes(fr.id)) : [];
  const filterNames   = filterFriends.map(fr => fr.firstName);
  const everyoneFilterName = filterNames.length <= 2
    ? filterNames.join(' & ')
    : filterNames.slice(0, -1).join(', ') + ' & ' + filterNames.slice(-1);

  // Insight
  let insightTitle = 'Best time to gather';
  let insightLabel = 'Everyone\u2019s pretty booked the next two weeks.';
  if (filterActive) {
    const allBusy = y => filterFriends.some(fr => busyOn(fr.id, y));
    let nf = null;
    for (let i = 0; i < 14; i++) {
      const d = addDays(new Date(), i);
      const y2 = ymd(d);
      if (!allBusy(y2)) { nf = y2; break; }
    }
    if (filterFriends.length === 1) {
      insightTitle = 'Next free for ' + everyoneFilterName;
      insightLabel = nf
        ? prettyDate(nf) + ' \u2014 ' + everyoneFilterName + ' is free'
        : everyoneFilterName + ' is booked the next two weeks.';
    } else {
      insightTitle = 'Best time for ' + everyoneFilterName;
      insightLabel = nf
        ? prettyDate(nf) + ' \u2014 all ' + filterFriends.length + ' are free'
        : 'No shared free days in the next two weeks.';
    }
  } else {
    let best = null;
    for (let i = 0; i < 14; i++) {
      const d = addDays(new Date(), i);
      const y2 = ymd(d);
      const freeNames = friends.filter(fr => !busyOn(fr.id, y2)).map(fr => fr.firstName);
      if (!best || freeNames.length > best.count) best = { count: freeNames.length, y: y2, names: freeNames };
      if (best.count === friends.length) break;
    }
    if (best) {
      if (best.count === 0)              insightLabel = 'No fully-free days soon \u2014 try the day view to find gaps.';
      else if (best.count === friends.length) insightLabel = prettyDate(best.y) + ' \u2014 all ' + friends.length + ' are free!';
      else insightLabel = prettyDate(best.y) + ' \u2014 ' + best.count + ' of ' + friends.length + ' free (' + best.names.join(', ') + ')';
    }
  }

  const grid       = buildGrid(cur);
  const monthLabel = MONTHS[cur.getMonth()] + ' ' + cur.getFullYear();

  return (
    <div style={{ animation: 'flin .25s ease both' }}>
      {/* Title + nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-h3)', color: 'var(--text-primary)' }}>
          Everyone &middot; {monthLabel}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <IconButton shape="circle" size="md" onClick={prevPeriod} aria-label="Previous month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </IconButton>
          <IconButton shape="circle" size="md" onClick={nextPeriod} aria-label="Next month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </IconButton>
          <button
            onClick={goToday}
            style={{
              border: '1px solid var(--border-strong)', background: 'var(--surface-card)',
              color: 'var(--text-secondary)', borderRadius: 'var(--radius-pill)',
              padding: '7px 14px', fontFamily: 'var(--font-sans)',
              fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-sm)', cursor: 'pointer',
              transition: 'background var(--dur-fast) var(--ease-out)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-card)'}
          >Today</button>
        </div>
      </div>

      {/* Insight banner */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--violet-500), var(--violet-700))',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 22px', margin: '12px 0 16px',
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: '-30px', top: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,.1)' }} />
        <div style={{ position: 'absolute', right: '60px', bottom: '-60px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
        {/* Icon */}
        <div style={{
          position: 'relative', flex: '0 0 auto', width: '44px', height: '44px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255,255,255,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)', letterSpacing: 'var(--ls-caps)', textTransform: 'uppercase', color: 'rgba(255,255,255,.75)' }}>
            {insightTitle}
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-title)', marginTop: '3px', color: '#fff' }}>
            {insightLabel}
          </div>
        </div>
      </div>

      {/* Friend filter pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
        {filterActive && (
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              border: '1px solid var(--border-brand)',
              background: 'var(--accent-wash)',
              color: 'var(--text-brand)',
              borderRadius: 'var(--radius-pill)', padding: '6px 14px',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
              fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-sm)',
            }}
            onClick={clearEveryoneFilter}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Showing {everyoneFilterName} &middot; Show all
          </button>
        )}

        {friends.map(fr => {
          const active = everyoneFilter.includes(fr.id);
          const dim    = filterActive && !active;
          return (
            <button
              key={fr.id}
              onClick={() => toggleEveryoneFilter(fr.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                border: '1px solid ' + (active ? fr.colorset.solid : 'var(--border-subtle)'),
                background: active ? fr.colorset.tint : 'var(--surface-card)',
                borderRadius: 'var(--radius-pill)', padding: '6px 13px 6px 7px',
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-sm)',
                color: active ? fr.colorset.deep : 'var(--text-secondary)',
                boxShadow: active ? '0 4px 12px -4px ' + fr.colorset.solid : 'none',
                opacity: dim ? 0.5 : 1,
                transition: 'all var(--dur-fast) var(--ease-out)',
              }}
            >
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: fr.colorset.solid, display: 'inline-block' }} />
              {fr.firstName}
            </button>
          );
        })}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '6px', marginBottom: '4px' }}>
        {WEEKDAYS.map(wd => (
          <div key={wd} style={{
            textAlign: 'center', fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)',
            color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)', paddingBottom: '4px',
          }}>{wd}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '6px' }}>
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
          const allFree  = freeCount === shown;
          const freeLabel = c.inMonth && allFree ? (shown === 1 ? 'free' : 'all free') : '';
          return (
            <div
              key={c.ymd}
              style={cellStyle(c)}
              onClick={() => openDay(c.ymd)}
              onMouseEnter={e => { if (!c.isToday) e.currentTarget.style.borderColor = 'var(--border-brand)'; }}
              onMouseLeave={e => { if (!c.isToday) e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={dayNumStyle(c)}>{c.day}</span>
                {freeLabel && (
                  <span style={{
                    fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-semibold)',
                    color: 'var(--cat-mint-ink)', background: 'var(--cat-mint-fill)',
                    borderRadius: 'var(--radius-pill)', padding: '1px 6px',
                  }}>{freeLabel}</span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                {dots.map(dot => (
                  <span
                    key={dot.id}
                    style={{ width: '9px', height: '9px', borderRadius: '50%', background: dot.color, display: 'inline-block' }}
                    title={dot.name}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
