import { Badge, Button } from './ds.jsx';

const DAY_NAMES      = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function fmt12(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, '0')}${period}`;
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return DAY_NAMES_FULL[d.getDay()].slice(0, 3) + ' ' + (d.getMonth() + 1) + '/' + d.getDate();
}

function describeSchedule(rule) {
  const parts = [];
  if (rule.recurrence === 'weekly' && rule.weekdays?.length) {
    parts.push(rule.weekdays.map(d => DAY_NAMES[d]).join(', '));
  } else if (rule.recurrence === 'once' && rule.date) {
    const d = new Date(rule.date + 'T12:00:00');
    parts.push(DAY_NAMES_FULL[d.getDay()] + ' ' + (d.getMonth() + 1) + '/' + d.getDate());
  } else if (rule.recurrence === 'daily') {
    parts.push('Every day');
  }
  if (rule.allDay) parts.push('All day');
  else if (rule.timeStart && rule.timeEnd) parts.push(`${fmt12(rule.timeStart)} – ${fmt12(rule.timeEnd)}`);
  if (rule.recurrence !== 'once') {
    if (rule.dateFrom && rule.dateTo) parts.push(`${fmtDate(rule.dateFrom)} – ${fmtDate(rule.dateTo)}`);
    else if (rule.dateFrom) parts.push(`from ${fmtDate(rule.dateFrom)}`);
    else if (rule.dateTo)   parts.push(`until ${fmtDate(rule.dateTo)}`);
  }
  return parts.join(' · ') || '—';
}

function statusTone(status) {
  if (status === 'busy') return 'danger';
  if (status === 'free') return 'success';
  return 'together';
}

function RuleCard({ rule, highlight }) {
  return (
    <div style={{
      background: highlight ? 'var(--accent-wash)' : 'var(--surface-sunken)',
      border: `1px solid ${highlight ? 'var(--border-brand)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      display: 'flex', flexDirection: 'column', gap: '5px', flex: '1 1 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)', color: 'var(--text-primary)' }}>
          {rule.title}
        </span>
        <Badge tone={statusTone(rule.status)}>{rule.status}</Badge>
      </div>
      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
        {describeSchedule(rule)}
      </div>
    </div>
  );
}

function applyFields(rule, fields) {
  return {
    ...rule,
    title:      fields.title      ?? rule.title,
    status:     fields.status     ?? rule.status,
    allDay:     fields.allDay     ?? rule.allDay,
    timeStart:  (fields.allDay ?? rule.allDay) ? null : (fields.timeStart ?? rule.timeStart),
    timeEnd:    (fields.allDay ?? rule.allDay) ? null : (fields.timeEnd   ?? rule.timeEnd),
    recurrence: fields.recurrence ?? rule.recurrence,
    weekdays:   fields.weekdays   ?? rule.weekdays,
    date:       fields.date       ?? rule.date,
  };
}

function UpdateRow({ rule, updateFields }) {
  const after = applyFields(rule, updateFields);
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
      <div style={{ flex: '1 1 0' }}>
        <div style={{ fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)', marginBottom: '5px' }}>Before</div>
        <RuleCard rule={rule} highlight={false} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: '18px', color: 'var(--text-tertiary)', paddingTop: '20px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
      <div style={{ flex: '1 1 0' }}>
        <div style={{ fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)', marginBottom: '5px' }}>After</div>
        <RuleCard rule={after} highlight={true} />
      </div>
    </div>
  );
}

export default function ConfirmDialog({ confirmDialog }) {
  if (!confirmDialog) return null;

  const { intent, affectedRules, updateFields, onConfirm, onCancel } = confirmDialog;
  const isDelete = intent === 'delete';
  const count    = affectedRules.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(16,16,25,.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000, padding: '20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-xl)', padding: '26px 26px 20px',
        maxWidth: '600px', width: '100%',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isDelete
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          }
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-title)', color: 'var(--text-primary)' }}>
            {isDelete ? 'Confirm deletion' : 'Confirm changes'}
          </span>
        </div>
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          {isDelete
            ? `${count} rule${count > 1 ? 's' : ''} will be permanently removed.`
            : `${count} rule${count > 1 ? 's' : ''} will be updated. Review the changes below.`}
        </div>

        {/* Rule list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto', paddingRight: '2px' }}>
          {affectedRules.map(rule => (
            isDelete ? (
              <div key={rule.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <RuleCard rule={rule} highlight={false} />
              </div>
            ) : (
              <UpdateRow key={rule.id} rule={rule} updateFields={updateFields} />
            )
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant={isDelete ? 'danger' : 'primary'} onClick={onConfirm}>
            {isDelete ? `Delete ${count > 1 ? count + ' rules' : 'rule'}` : 'Apply changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
