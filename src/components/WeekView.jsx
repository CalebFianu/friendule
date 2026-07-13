import { ymd, addDays, fmtTime, WEEKDAYS } from '../utils/dateUtils';

const HOUR_PX    = 46;
const RAIL_START = 6;
const RAIL_END   = 23;

function statusCat(status) {
  if (status === 'busy')    return 'rose';
  if (status === 'together') return 'violet';
  return 'mint';
}

export default function WeekView({ cur, friend, instances, openFriendDay, openEdit }) {
  const todayY = ymd(new Date());
  const now    = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const totalPx = (RAIL_END - RAIL_START) * HOUR_PX;
  const ws = addDays(cur, -cur.getDay());

  const weekHours = [];
  for (let h = RAIL_START; h < RAIL_END; h++) {
    const ap = h < 12 ? 'AM' : 'PM';
    let hh = h % 12; if (hh === 0) hh = 12;
    weekHours.push({ label: hh + ' ' + ap, hour: h });
  }

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d  = addDays(ws, i);
    const y  = ymd(d);
    const isT = y === todayY;
    const inst   = instances(friend.id, y);
    const allDay = inst.filter(e => e.allDay);
    const timed  = inst.filter(e => !e.allDay);
    let nowTop = null;
    if (isT && nowMin >= RAIL_START * 60 && nowMin <= RAIL_END * 60) {
      nowTop = ((nowMin - RAIL_START * 60) / 60) * HOUR_PX;
    }
    weekDays.push({ d, y, isT, wd: d.getDay(), allDay, timed, dayNum: d.getDate(), nowTop });
  }

  return (
    <div style={{
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--surface-card)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ overflow: 'auto', maxHeight: '70vh' }}>
        <div style={{ minWidth: '780px' }}>

          {/* Day header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '56px repeat(7,1fr)',
            position: 'sticky', top: 0,
            background: 'var(--surface-card)', zIndex: 6,
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div />
            {weekDays.map(day => (
              <div key={day.y} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                padding: '10px 4px',
                borderLeft: '1px solid var(--border-subtle)',
                background: day.isT ? 'var(--accent-wash)' : 'var(--surface-card)',
              }}>
                <span style={{
                  fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)',
                  color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)',
                }}>{WEEKDAYS[day.wd]}</span>
                <span style={day.isT ? {
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'var(--accent)', color: '#fff',
                  fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-sm)',
                } : {
                  fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)',
                  fontSize: 'var(--fs-sm)', color: 'var(--text-primary)',
                }}>{day.dayNum}</span>
              </div>
            ))}
          </div>

          {/* All-day row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '56px repeat(7,1fr)',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--surface-sunken)',
          }}>
            <div style={{
              fontSize: 'var(--fs-2xs)', color: 'var(--text-tertiary)', fontWeight: 'var(--fw-semibold)',
              textAlign: 'right', padding: '8px 6px 0 0', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)',
            }}>all-day</div>
            {weekDays.map(day => (
              <div key={day.y} style={{
                padding: '4px',
                display: 'flex', flexDirection: 'column', gap: '2px',
                borderLeft: '1px solid var(--border-subtle)',
                minHeight: '28px',
              }}>
                {day.allDay.map(e => {
                  const cat  = statusCat(e.status);
                  const fill = `var(--cat-${cat}-fill)`;
                  const ink  = `var(--cat-${cat}-ink)`;
                  return (
                    <div
                      key={e.id}
                      onClick={ev => { ev.stopPropagation(); openEdit(e); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '2px 7px', borderRadius: 'var(--radius-xs)',
                        background: fill, borderLeft: `3px solid ${ink}`,
                        cursor: 'pointer', overflow: 'hidden',
                      }}
                    >
                      {e.fromFriend && (
                        <span style={{ flexShrink: 0, width: '8px', height: '8px', borderRadius: '50%', background: e.fromFriend.colorset.solid }} />
                      )}
                      <span style={{
                        fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-semibold)', color: ink,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{e.title}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7,1fr)' }}>
            {/* Hour labels */}
            <div style={{ position: 'relative' }}>
              {weekHours.map(h => (
                <div key={h.hour} style={{
                  height: HOUR_PX + 'px',
                  fontSize: 'var(--fs-2xs)', color: 'var(--text-tertiary)', fontWeight: 'var(--fw-medium)',
                  textAlign: 'right', paddingRight: '8px',
                  fontFamily: 'var(--font-mono)',
                  transform: 'translateY(-7px)',
                }}>{h.label}</div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map(day => (
              <div key={day.y} style={{
                position: 'relative', height: totalPx + 'px',
                borderLeft: '1px solid var(--border-subtle)',
                background: `repeating-linear-gradient(to bottom, var(--border-subtle) 0, var(--border-subtle) 1px, transparent 1px, transparent ${HOUR_PX}px)`,
              }}>
                {/* Clickable hour cells */}
                {weekHours.map((h, hi) => (
                  <div
                    key={h.hour}
                    style={{ position: 'absolute', left: 0, right: 0, top: (hi * HOUR_PX) + 'px', height: HOUR_PX + 'px', cursor: 'pointer' }}
                    onClick={() => openFriendDay(day.y, (RAIL_START + hi) * 60)}
                  />
                ))}

                {/* Timed events */}
                {day.timed.map(e => {
                  const top    = Math.max(0, ((e.startMin - RAIL_START * 60) / 60) * HOUR_PX);
                  const bottom = ((Math.min(e.endMin, RAIL_END * 60) - RAIL_START * 60) / 60) * HOUR_PX;
                  const cat    = statusCat(e.status);
                  const fill   = `var(--cat-${cat}-fill)`;
                  const ink    = `var(--cat-${cat}-ink)`;
                  return (
                    <div
                      key={e.id}
                      onClick={ev => { ev.stopPropagation(); openEdit(e); }}
                      style={{
                        position: 'absolute', top: top + 'px', height: Math.max(20, bottom - top) + 'px',
                        left: '3px', right: '3px',
                        borderRadius: 'var(--radius-sm)',
                        padding: '3px 7px', overflow: 'hidden', cursor: 'pointer',
                        background: fill,
                        borderLeft: `3px solid ${ink}`,
                        transition: 'filter var(--dur-fast) var(--ease-out)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.97)'}
                      onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    >
                      <div style={{
                        fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)',
                        fontSize: 'var(--fs-xs)', color: ink,
                        lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        paddingRight: e.fromFriend ? '18px' : '0',
                      }}>{e.title}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-2xs)', fontWeight: 500, color: ink, opacity: 0.85, marginTop: '1px' }}>
                        {fmtTime(e.startMin)}–{fmtTime(e.endMin)}
                      </div>
                      {e.fromFriend && (
                        <span style={{
                          position: 'absolute', top: '4px', right: '5px',
                          width: '12px', height: '12px', borderRadius: '50%',
                          background: e.fromFriend.colorset.solid,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '7px', color: '#fff', fontWeight: 'var(--fw-bold)',
                        }}>{e.fromFriend.initials[0]}</span>
                      )}
                    </div>
                  );
                })}

                {/* Now indicator */}
                {day.nowTop != null && (
                  <div style={{
                    position: 'absolute', left: 0, right: 0, top: day.nowTop + 'px',
                    height: '2px', background: 'var(--accent)', zIndex: 5,
                    boxShadow: '0 0 0 3px var(--accent-wash)',
                  }}>
                    <div style={{
                      position: 'absolute', left: '-4px', top: '-4px',
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: 'var(--accent)',
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
