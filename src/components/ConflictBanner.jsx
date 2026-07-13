import { Badge, Button } from './ds.jsx';

function describeRule(r) {
  const when = r.recurrence === 'once'
    ? r.date
    : r.recurrence === 'daily'
    ? 'every day'
    : 'weekly (' + (r.weekdays || []).map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ') + ')';
  return `"${r.title}" · ${r.status} · ${when}`;
}

export default function ConflictBanner({ conflicts, deleteEvent, openEdit }) {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div style={{
      margin: '14px 0 0',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--cat-amber-ink)',
      background: 'var(--cat-amber-fill)',
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cat-amber-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span style={{ fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-sm)', color: 'var(--cat-amber-ink)' }}>
          {conflicts.length} conflicting rule{conflicts.length > 1 ? 's' : ''} — busy and free times overlap
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {conflicts.map(([a, b], i) => (
          <div key={i} style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[a, b].map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <Badge tone={r.status === 'busy' ? 'danger' : r.status === 'free' ? 'success' : 'together'}>
                    {r.status}
                  </Badge>
                  <span style={{
                    flex: 1, fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-medium)',
                    color: 'var(--text-primary)', minWidth: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {describeRule(r)}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <Button variant="secondary" size="sm" onClick={() => openEdit({ ruleId: r.id })}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => deleteEvent(r.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
