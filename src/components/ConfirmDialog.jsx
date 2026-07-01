const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function fmt12(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, '0')}${period}`;
}

function describeSchedule(rule) {
  const parts = [];
  if (rule.recurrence === 'weekly' && rule.weekdays?.length) {
    parts.push(rule.weekdays.map(d => DAY_NAMES[d]).join(', '));
  } else if (rule.recurrence === 'once' && rule.date) {
    // e.g. "Wed Jul 2"
    const d = new Date(rule.date + 'T12:00:00');
    parts.push(DAY_NAMES_FULL[d.getDay()] + ' ' + (d.getMonth() + 1) + '/' + d.getDate());
  } else if (rule.recurrence === 'daily') {
    parts.push('Every day');
  }
  if (rule.allDay) {
    parts.push('All day');
  } else if (rule.timeStart && rule.timeEnd) {
    parts.push(`${fmt12(rule.timeStart)} – ${fmt12(rule.timeEnd)}`);
  }
  return parts.join(' · ') || '—';
}

const STATUS_STYLE = {
  busy:     { bg: '#FDEEE9', color: '#A64020', label: 'Busy' },
  free:     { bg: '#E6F4EE', color: '#2A7A50', label: 'Free' },
  together: { bg: '#E8EEFF', color: '#3040A0', label: 'Together' },
};

function StatusPill({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.busy;
  return (
    <span style={{
      background: s.bg, color: s.color, borderRadius: '999px',
      padding: '2px 9px', fontSize: '11px', fontWeight: 800, letterSpacing: '.2px',
    }}>
      {s.label}
    </span>
  );
}

function RuleCard({ rule, highlight }) {
  return (
    <div style={{
      background: highlight ? '#FFF8EE' : '#F8F3EE',
      border: `1px solid ${highlight ? '#F0D9A0' : '#EDE3D8'}`,
      borderRadius: '12px', padding: '10px 14px',
      display: 'flex', flexDirection: 'column', gap: '5px', flex: '1 1 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 800, fontSize: '14px', color: '#3A322C' }}>{rule.title}</span>
        <StatusPill status={rule.status} />
      </div>
      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#7A6E64' }}>
        {describeSchedule(rule)}
      </div>
    </div>
  );
}

function applyFields(rule, fields) {
  return {
    ...rule,
    title:     fields.title     ?? rule.title,
    status:    fields.status    ?? rule.status,
    allDay:    fields.allDay    ?? rule.allDay,
    timeStart: (fields.allDay ?? rule.allDay) ? null : (fields.timeStart ?? rule.timeStart),
    timeEnd:   (fields.allDay ?? rule.allDay) ? null : (fields.timeEnd   ?? rule.timeEnd),
    recurrence: fields.recurrence ?? rule.recurrence,
    weekdays:  fields.weekdays  ?? rule.weekdays,
    date:      fields.date      ?? rule.date,
  };
}

function UpdateRow({ rule, updateFields }) {
  const after = applyFields(rule, updateFields);
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
      <div style={{ flex: '1 1 0' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#B6A99C', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '5px' }}>Before</div>
        <RuleCard rule={rule} highlight={false} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: '18px', color: '#C0A888', paddingTop: '20px' }}>&#8594;</div>
      <div style={{ flex: '1 1 0' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#B6A99C', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '5px' }}>After</div>
        <RuleCard rule={after} highlight={true} />
      </div>
    </div>
  );
}

export default function ConfirmDialog({ confirmDialog }) {
  if (!confirmDialog) return null;

  const { intent, affectedRules, updateFields, onConfirm, onCancel } = confirmDialog;
  const isDelete = intent === 'delete';
  const count = affectedRules.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(30,20,10,.48)',
        backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000, padding: '20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        background: '#FFFCF9', borderRadius: '22px', padding: '26px 26px 20px',
        maxWidth: '600px', width: '100%',
        boxShadow: '0 28px 70px rgba(80,45,15,.26)',
        border: '1px solid #EDE0D0',
        display: 'flex', flexDirection: 'column', gap: '0',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <span style={{ fontSize: '20px', lineHeight: 1 }}>{isDelete ? '⚠' : '✎'}</span>
          <span style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 800, fontSize: '17px', color: '#3A322C' }}>
            {isDelete ? 'Confirm deletion' : 'Confirm changes'}
          </span>
        </div>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#9A8E83', marginBottom: '18px' }}>
          {isDelete
            ? `${count} rule${count > 1 ? 's' : ''} will be permanently removed.`
            : `${count} rule${count > 1 ? 's' : ''} will be updated. Review the changes below.`}
        </div>

        {/* Rule list */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '10px',
          maxHeight: '340px', overflowY: 'auto',
          paddingRight: '2px',
        }}>
          {affectedRules.map(rule => (
            isDelete ? (
              <div key={rule.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: '#C04040', fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>✕</span>
                <RuleCard rule={rule} highlight={false} />
              </div>
            ) : (
              <UpdateRow key={rule.id} rule={rule} updateFields={updateFields} />
            )
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              border: '1px solid #EDE3D8', background: '#fff', color: '#6B5E52',
              borderRadius: '12px', padding: '10px 20px', fontWeight: 700, fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              border: 'none',
              background: isDelete ? '#C04040' : '#E07A53',
              color: '#fff', borderRadius: '12px', padding: '10px 22px',
              fontWeight: 800, fontSize: '14px', cursor: 'pointer',
            }}
          >
            {isDelete ? `Delete ${count > 1 ? count + ' rules' : 'rule'}` : `Apply changes`}
          </button>
        </div>
      </div>
    </div>
  );
}
