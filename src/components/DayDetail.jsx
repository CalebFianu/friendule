import { prettyDate, fmtTime } from '../utils/dateUtils';
import { Badge } from './ds.jsx';

function statusTone(status) {
  if (status === 'busy') return 'danger';
  if (status === 'together') return 'together';
  return 'success';
}

export default function DayDetail({ dayDetail, closeDay }) {
  if (!dayDetail) return null;

  const freeN = dayDetail.rows.filter(r => !r.busy).length;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(16,16,25,.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '18px', zIndex: 50,
        animation: 'ovin .2s ease both',
      }}
      onClick={closeDay}
    >
      <div
        style={{
          width: '420px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '22px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
          animation: 'pop .24s cubic-bezier(.2,.8,.3,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-title)', color: 'var(--text-primary)' }}>
            {prettyDate(dayDetail.ymd)}
          </div>
          <button
            style={{
              width: '34px', height: '34px', borderRadius: 'var(--radius-pill)',
              border: 'none', background: 'var(--surface-inset)',
              color: 'var(--text-secondary)', fontSize: '18px', cursor: 'pointer',
            }}
            onClick={closeDay}
          >&#10005;</button>
        </div>
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {freeN} of {dayDetail.rows.length} friends look free
        </div>

        {/* Friend rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {dayDetail.rows.map(row => {
            const cs = row.f.colorset;
            return (
              <div key={row.f.id} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', padding: '12px 13px',
              }}>
                {/* Avatar using friend colorset */}
                <div style={{
                  flex: '0 0 auto', width: '40px', height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: cs.tint, color: cs.deep,
                  border: '1.5px solid ' + cs.tintBorder,
                  fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-sm)',
                }}>
                  {row.f.initials}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)', color: 'var(--text-primary)' }}>
                      {row.f.name}
                    </span>
                    <Badge tone={row.busy ? 'danger' : row.together ? 'together' : 'success'}>
                      {row.busy ? 'Busy' : row.together ? 'Together' : 'Free'}
                    </Badge>
                  </div>

                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {row.evs.map(e => (
                      <div key={e.id} style={{
                        fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-medium)',
                        color: e.status === 'busy' ? 'var(--cat-rose-ink)' : e.status === 'together' ? 'var(--cat-violet-ink)' : 'var(--cat-mint-ink)',
                        background: e.status === 'busy' ? 'var(--cat-rose-fill)' : e.status === 'together' ? 'var(--cat-violet-fill)' : 'var(--cat-mint-fill)',
                        borderRadius: 'var(--radius-xs)', padding: '2px 8px', display: 'inline-block', width: 'fit-content',
                      }}>
                        {(e.allDay ? 'All day' : fmtTime(e.startMin) + '–' + fmtTime(e.endMin)) + ' · ' + e.title}
                      </div>
                    ))}
                    {row.evs.length === 0 && (
                      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--success)', fontWeight: 'var(--fw-medium)' }}>
                        Wide open — ping them!
                      </div>
                    )}
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
