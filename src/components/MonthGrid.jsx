import { buildGrid } from '../utils/dateUtils';
import { shortTime } from '../utils/dateUtils';

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

function chipStyle(e, f) {
  const cs = f.colorset;
  if (e.status === 'busy') {
    return { background: cs.solid, color: '#fff', borderRadius: '7px', padding: '2px 7px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', lineHeight: '1.55' };
  }
  if (e.status === 'together') {
    return { background: '#FDE8F5', color: '#A0357A', border: '1px solid #F3BBE0', borderRadius: '7px', padding: '1px 6px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', lineHeight: '1.55' };
  }
  return { background: '#E6F4ED', color: '#2A7A50', border: '1px solid #9ECDB0', borderRadius: '7px', padding: '1px 6px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', lineHeight: '1.55' };
}

export default function MonthGrid({ cur, friend, instances, openFriendDay, openEdit }) {
  const grid = buildGrid(cur);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '8px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(wd => (
          <div key={wd} style={{ textAlign: 'center', fontSize: '11.5px', fontWeight: 800, color: '#A99C8F', textTransform: 'uppercase', letterSpacing: '.6px', paddingBottom: '2px' }}>{wd}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '8px', marginTop: '4px' }}>
        {grid.map(c => {
          const evs = instances(friend.id, c.ymd);
          const chips = evs.slice(0, 3);
          return (
            <div key={c.ymd} style={cellBaseStyle(c)} onClick={() => openFriendDay(c.ymd, 720)}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><span style={numBadgeStyle(c)}>{c.day}</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '3px' }}>
                {chips.map(e => (
                  <div key={e.id} style={chipStyle(e, friend)} onClick={ev => { ev.stopPropagation(); openEdit(e); }}>
                    {e.allDay ? e.title : shortTime(e.startMin) + ' ' + e.title}
                  </div>
                ))}
                {evs.length > 3 && <div style={{ fontSize: '11px', color: '#A99C8F', fontWeight: 700, paddingLeft: '3px' }}>+{evs.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
