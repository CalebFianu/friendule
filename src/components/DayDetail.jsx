import { prettyDate, fmtTime } from '../utils/dateUtils';

export default function DayDetail({ dayDetail, closeDay }) {
  if (!dayDetail) return null;

  const freeN = dayDetail.rows.filter(r => !r.busy).length;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(58,42,28,.34)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px', zIndex: 50, animation: 'ovin .2s ease both' }} onClick={closeDay}>
      <div style={{ width: '420px', maxWidth: '100%', maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: '24px', padding: '22px', boxShadow: '0 24px 60px rgba(58,42,28,.28)', animation: 'pop .24s cubic-bezier(.2,.8,.3,1) both' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: '19px' }}>{prettyDate(dayDetail.ymd)}</div>
          <button style={{ width: '34px', height: '34px', borderRadius: '999px', border: 'none', background: '#F3ECE2', color: '#6B5E52', fontSize: '18px', cursor: 'pointer', fontWeight: 700 }} onClick={closeDay}>✕</button>
        </div>
        <div style={{ fontSize: '13px', color: '#9A8E83', fontWeight: 600, marginBottom: '14px' }}>{freeN} of {dayDetail.rows.length} friends look free</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {dayDetail.rows.map(row => {
            const cs = row.f.colorset;
            return (
              <div key={row.f.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', border: '1px solid #F1EAE0', borderRadius: '16px', padding: '12px 13px' }}>
                <div style={{ flex: '0 0 auto', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: cs.tint, color: cs.deep, border: '1.5px solid ' + cs.tintBorder, fontWeight: 800, fontSize: '14px', fontFamily: "'Quicksand',sans-serif" }}>{row.f.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '15px' }}>{row.f.name}</span>
                    <span style={row.busy
                      ? { fontSize: '11px', fontWeight: 800, color: '#C0563E', background: '#FBEDE7', padding: '1px 8px', borderRadius: '999px' }
                      : row.together
                      ? { fontSize: '11px', fontWeight: 800, color: '#A0357A', background: '#FDE8F5', padding: '1px 8px', borderRadius: '999px' }
                      : { fontSize: '11px', fontWeight: 800, color: '#4F9A60', background: '#EAF6EC', padding: '1px 8px', borderRadius: '999px' }
                    }>{row.busy ? 'Busy' : row.together ? 'Together' : 'Free'}</span>
                  </div>
                  <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {row.evs.map(e => (
                      <div key={e.id} style={{
                        fontSize: '12.5px', fontWeight: 700,
                        color: e.status === 'busy' ? '#7A6B5D' : e.status === 'together' ? '#A0357A' : cs.deep,
                        background: e.status === 'busy' ? '#F6EFE6' : e.status === 'together' ? '#FDE8F5' : cs.tint,
                        borderRadius: '7px', padding: '2px 8px', display: 'inline-block', width: 'fit-content'
                      }}>
                        {(e.allDay ? 'All day' : fmtTime(e.startMin) + '–' + fmtTime(e.endMin)) + ' · ' + e.title}
                      </div>
                    ))}
                    {row.evs.length === 0 && <div style={{ fontSize: '13px', color: '#5BA06B', fontWeight: 700 }}>Wide open — ping them!</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
