function describeRule(r) {
  const when = r.recurrence === 'once'
    ? r.date
    : r.recurrence === 'daily'
    ? 'every day'
    : 'weekly (' + (r.weekdays || []).map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ') + ')';
  return '"' + r.title + '" · ' + r.status + ' · ' + when;
}

export default function ConflictBanner({ conflicts, deleteEvent, openEdit }) {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div style={{ margin: '14px 2px 0', borderRadius: '16px', border: '1px solid #F5C4A1', background: '#FFF5EC', padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '15px' }}>⚠</span>
        <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#8B4513' }}>
          {conflicts.length} conflicting rule{conflicts.length > 1 ? 's' : ''} — this friend can't be both busy and free on the same day
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {conflicts.map(([a, b], i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #F1DCC8', borderRadius: '12px', padding: '10px 12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[a, b].map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, fontSize: '12.5px', fontWeight: 700, color: '#5A4F45', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {describeRule(r)}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flex: '0 0 auto' }}>
                    <button
                      onClick={() => openEdit({ ruleId: r.id })}
                      style={{ border: '1px solid #E3CFBC', background: '#fff', color: '#7A5F3A', borderRadius: '8px', padding: '3px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(r.id)}
                      style={{ border: 'none', background: '#C0563E', color: '#fff', borderRadius: '8px', padding: '3px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Delete
                    </button>
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
