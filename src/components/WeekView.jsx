import { ymd, addDays, fmtTime, WEEKDAYS } from '../utils/dateUtils';

const HOUR_PX = 46;
const RAIL_START = 6;
const RAIL_END = 23;

export default function WeekView({ cur, friend, instances, openFriendDay, openEdit }) {
  const todayY = ymd(new Date());
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const totalPx = (RAIL_END - RAIL_START) * HOUR_PX;
  const ws = addDays(cur, -cur.getDay());

  const weekHours = [];
  for (let h = RAIL_START; h < RAIL_END; h++) {
    const ap = h < 12 ? 'AM' : 'PM';
    let hh = h % 12;
    if (hh === 0) hh = 12;
    weekHours.push({ label: hh + ' ' + ap, hour: h });
  }

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(ws, i);
    const y = ymd(d);
    const isT = y === todayY;
    const wd = d.getDay();
    const inst = instances(friend.id, y);
    const allDay = inst.filter(e => e.allDay);
    const timed = inst.filter(e => !e.allDay);

    let nowTop = null;
    if (isT && nowMin >= RAIL_START * 60 && nowMin <= RAIL_END * 60) {
      nowTop = ((nowMin - RAIL_START * 60) / 60) * HOUR_PX;
    }

    weekDays.push({ d, y, isT, wd, allDay, timed, dayNum: d.getDate(), nowTop });
  }

  return (
    <div style={{ border: '1px solid #EFE7DD', borderRadius: '20px', background: '#fff', overflow: 'hidden' }}>
      <div style={{ overflow: 'auto', maxHeight: '70vh' }}>
        <div style={{ minWidth: '780px' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '58px repeat(7,1fr)', position: 'sticky', top: 0, background: '#fff', zIndex: 6, borderBottom: '1px solid #EFE7DD' }}>
            <div />
            {weekDays.map(day => (
              <div key={day.y} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '10px 4px', borderLeft: '1px solid #F1EAE0', background: day.isT ? '#FFF6F0' : '#fff' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#A99C8F', textTransform: 'uppercase', letterSpacing: '.5px' }}>{WEEKDAYS[day.wd]}</span>
                <span style={day.isT
                  ? { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '999px', background: '#E07A53', color: '#fff', fontWeight: 800, fontSize: '13px', fontFamily: "'Quicksand',sans-serif" }
                  : { fontWeight: 800, fontSize: '15px', fontFamily: "'Quicksand',sans-serif", color: '#3A322C' }
                }>{day.dayNum}</span>
              </div>
            ))}
          </div>

          {/* All-day row */}
          <div style={{ display: 'grid', gridTemplateColumns: '58px repeat(7,1fr)', borderBottom: '1px solid #EFE7DD', background: '#FCFAF6' }}>
            <div style={{ fontSize: '10px', color: '#A99C8F', fontWeight: 700, textAlign: 'right', padding: '8px 6px 0 0' }}>all-day</div>
            {weekDays.map(day => (
              <div key={day.y} style={{ padding: '5px', display: 'flex', flexDirection: 'column', gap: '3px', borderLeft: '1px solid #F1EAE0', minHeight: '30px' }}>
                {day.allDay.map(e => {
                  const cs = friend.colorset;
                  const allDayStyle = e.status === 'busy'
                    ? { background: cs.solid, color: '#fff', borderRadius: '7px', padding: '2px 7px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', lineHeight: '1.55' }
                    : e.status === 'together'
                    ? { background: '#FDE8F5', color: '#A0357A', border: '1px solid #F3BBE0', borderRadius: '7px', padding: '1px 6px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', lineHeight: '1.55' }
                    : { background: cs.tint, color: cs.deep, border: '1px solid ' + cs.tintBorder, borderRadius: '7px', padding: '1px 6px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', lineHeight: '1.55' };
                  return (
                    <div key={e.id} onClick={ev => { ev.stopPropagation(); openEdit(e); }} style={allDayStyle}>{e.title}</div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '58px repeat(7,1fr)' }}>
            <div style={{ position: 'relative' }}>
              {weekHours.map((h) => (
                <div key={h.hour} style={{ height: HOUR_PX + 'px', fontSize: '10px', color: '#A99C8F', fontWeight: 700, textAlign: 'right', paddingRight: '7px', transform: 'translateY(-7px)' }}>{h.label}</div>
              ))}
            </div>
            {weekDays.map(day => (
              <div key={day.y} style={{ position: 'relative', height: totalPx + 'px', borderLeft: '1px solid #F1EAE0', background: 'repeating-linear-gradient(to bottom,#F4EDE3 0,#F4EDE3 1px,transparent 1px,transparent ' + HOUR_PX + 'px)' }}>
                {/* Clickable hour cells */}
                {weekHours.map((h, hi) => (
                  <div key={h.hour} style={{ position: 'absolute', left: 0, right: 0, top: (hi * HOUR_PX) + 'px', height: HOUR_PX + 'px', cursor: 'pointer' }} onClick={() => openFriendDay(day.y, (RAIL_START + hi) * 60)} />
                ))}
                {/* Timed events */}
                {day.timed.map(e => {
                  const top = Math.max(0, ((e.startMin - RAIL_START * 60) / 60) * HOUR_PX);
                  const bottom = ((Math.min(e.endMin, RAIL_END * 60) - RAIL_START * 60) / 60) * HOUR_PX;
                  const cs = friend.colorset;
                  const timedBg = e.status === 'busy' ? cs.solid : e.status === 'together' ? '#FDE8F5' : '#E6F4ED';
                  const timedColor = e.status === 'busy' ? '#fff' : e.status === 'together' ? '#A0357A' : '#2A7A50';
                  const timedBorder = e.status === 'busy' ? 'none' : e.status === 'together' ? '1px dashed #F3BBE0' : '1px dashed #9ECDB0';
                  return (
                    <div key={e.id} onClick={ev => { ev.stopPropagation(); openEdit(e); }} style={{
                      position: 'absolute', top: top + 'px', height: Math.max(20, bottom - top) + 'px',
                      left: '3px', right: '3px', borderRadius: '9px', padding: '3px 7px', overflow: 'hidden', cursor: 'pointer',
                      background: timedBg, color: timedColor, border: timedBorder
                    }}>
                      <div style={{ fontWeight: 800, fontSize: '11.5px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                      <div style={{ fontSize: '10px', fontWeight: 700, opacity: .85, marginTop: '1px' }}>{fmtTime(e.startMin)}–{fmtTime(e.endMin)}</div>
                    </div>
                  );
                })}
                {/* Now indicator */}
                {day.nowTop != null && (
                  <div style={{ position: 'absolute', left: 0, right: 0, top: day.nowTop + 'px', height: '2px', background: '#E07A53', zIndex: 5, boxShadow: '0 0 0 3px rgba(224,122,83,.12)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
