import { Button, Input } from './ds.jsx';

const COMMON_ZONES = [
  'Africa/Accra', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Cairo', 'Africa/Johannesburg',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Sao_Paulo', 'America/Toronto',
  'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Dubai', 'Asia/Singapore',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Australia/Sydney', 'Pacific/Auckland',
];

function Label({ children, style = {} }) {
  return (
    <label style={{
      display: 'block',
      fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)',
      color: 'var(--text-tertiary)', textTransform: 'uppercase',
      letterSpacing: 'var(--ls-caps)',
      ...style,
    }}>
      {children}
    </label>
  );
}

export default function AddFriendModal({ addFriendModal, patchAf, closeAddFriend, saveNewFriend }) {
  if (!addFriendModal) return null;

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
      onClick={closeAddFriend}
    >
      <div
        style={{
          width: '420px', maxWidth: '100%',
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
          animation: 'pop .24s cubic-bezier(.2,.8,.3,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-h3)', color: 'var(--text-primary)' }}>Add a friend</div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginTop: '2px' }}>They&apos;ll show up in your schedule view.</div>
          </div>
          <button
            style={{
              width: '34px', height: '34px', borderRadius: 'var(--radius-pill)',
              border: 'none', background: 'var(--surface-inset)',
              color: 'var(--text-secondary)', fontSize: '18px', cursor: 'pointer',
            }}
            onClick={closeAddFriend}
          >&#10005;</button>
        </div>

        <Label>Name</Label>
        <Input
          value={addFriendModal.name}
          onChange={e => patchAf({ name: e.target.value })}
          placeholder="e.g. Jordan Lee"
          wrapStyle={{ marginTop: '6px', width: '100%' }}
        />

        <Label style={{ marginTop: '16px' }}>Description</Label>
        <Input
          value={addFriendModal.description}
          onChange={e => patchAf({ description: e.target.value })}
          placeholder="e.g. Remote dev · free on weekends"
          wrapStyle={{ marginTop: '6px', width: '100%' }}
        />

        <Label style={{ marginTop: '16px' }}>Timezone</Label>
        <div style={{
          marginTop: '6px',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}>
          <select
            value={addFriendModal.timezone || 'Africa/Accra'}
            onChange={e => patchAf({ timezone: e.target.value })}
            style={{
              width: '100%', border: 'none', outline: 'none',
              padding: '12px 14px',
              fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)',
              fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)',
              background: 'transparent', cursor: 'pointer',
            }}
          >
            {COMMON_ZONES.map(tz => (
              <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeAddFriend}>Cancel</Button>
          <Button variant="primary" onClick={saveNewFriend}>Add friend</Button>
        </div>
      </div>
    </div>
  );
}
