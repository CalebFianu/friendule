import { buildGrid, shortTime } from '../utils/dateUtils';

// Map status to design system category
function statusCategory(status) {
  if (status === 'busy')    return 'rose';
  if (status === 'together') return 'violet';
  return 'mint';
}

function cellStyle(c) {
  return {
    minHeight: '94px',
    background: c.inMonth ? 'var(--surface-card)' : 'var(--surface-sunken)',
    border: `1px solid ${c.isToday ? 'var(--accent)' : 'var(--border-subtle)'}`,
    borderRadius: 'var(--radius-md)',
    padding: '7px 8px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: c.isToday ? `0 0 0 2px var(--accent-wash)` : 'var(--shadow-xs)',
    opacity: c.inMonth ? 1 : 0.5,
    transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
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
    color: c.inMonth ? 'var(--text-secondary)' : 'var(--text-tertiary)',
    padding: '0 2px',
  };
}

// Inline EventChip (avoids re-importing, keeps status color logic local)
function Chip({ event, onClick }) {
  const cat = statusCategory(event.status);
  const fill = `var(--cat-${cat}-fill)`;
  const ink  = `var(--cat-${cat}-ink)`;

  return (
    <div
      onClick={e => { e.stopPropagation(); onClick(event); }}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '2px 7px', borderRadius: 'var(--radius-xs)',
        background: fill, borderLeft: `3px solid ${ink}`,
        cursor: 'pointer', overflow: 'hidden',
        transition: 'filter var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
      }}
      onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.97)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      {event.fromFriend && (
        <span style={{
          flexShrink: 0, width: '10px', height: '10px', borderRadius: '50%',
          background: event.fromFriend.colorset.solid, display: 'inline-block',
        }} title={event.fromFriend.name} />
      )}
      <span style={{
        fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-semibold)', color: ink,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4,
      }}>
        {event.allDay ? event.title : shortTime(event.startMin) + ' ' + event.title}
      </span>
    </div>
  );
}

export default function MonthGrid({ cur, friend, instances, openFriendDay, openEdit }) {
  const grid = buildGrid(cur);

  return (
    <div>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '6px', marginBottom: '4px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(wd => (
          <div key={wd} style={{
            textAlign: 'center',
            fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)',
            color: 'var(--text-tertiary)', textTransform: 'uppercase',
            letterSpacing: 'var(--ls-caps)', paddingBottom: '4px',
          }}>{wd}</div>
        ))}
      </div>

      {/* Cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '6px' }}>
        {grid.map(c => {
          const evs = instances(friend.id, c.ymd);
          const chips = evs.slice(0, 3);
          return (
            <div
              key={c.ymd}
              style={cellStyle(c)}
              onClick={() => openFriendDay(c.ymd, 720)}
              onMouseEnter={e => { if (!c.isToday) e.currentTarget.style.borderColor = 'var(--border-brand)'; }}
              onMouseLeave={e => { if (!c.isToday) e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span style={dayNumStyle(c)}>{c.day}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '3px' }}>
                {chips.map(e => (
                  <Chip key={e.id} event={e} onClick={openEdit} />
                ))}
                {evs.length > 3 && (
                  <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-tertiary)', fontWeight: 'var(--fw-medium)', paddingLeft: '3px' }}>
                    +{evs.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
