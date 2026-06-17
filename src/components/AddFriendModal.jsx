const COMMON_ZONES = [
  'Africa/Accra', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Cairo', 'Africa/Johannesburg',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Sao_Paulo', 'America/Toronto',
  'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Dubai', 'Asia/Singapore',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Australia/Sydney', 'Pacific/Auckland',
];

export default function AddFriendModal({ addFriendModal, patchAf, closeAddFriend, saveNewFriend }) {
  if (!addFriendModal) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(58,42,28,.34)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px', zIndex: 50, animation: 'ovin .2s ease both' }} onClick={closeAddFriend}>
      <div style={{ width: '420px', maxWidth: '100%', background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 24px 60px rgba(58,42,28,.28)', animation: 'pop .24s cubic-bezier(.2,.8,.3,1) both' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: '20px' }}>Add a friend</div>
            <div style={{ fontSize: '13px', color: '#9A8E83', fontWeight: 600, marginTop: '2px' }}>They&apos;ll show up in your schedule view.</div>
          </div>
          <button style={{ width: '34px', height: '34px', borderRadius: '999px', border: 'none', background: '#F3ECE2', color: '#6B5E52', fontSize: '18px', cursor: 'pointer', fontWeight: 700, flex: '0 0 auto' }} onClick={closeAddFriend}>&#10005;</button>
        </div>

        <label style={{ fontSize: '12px', fontWeight: 800, color: '#9A8E83', textTransform: 'uppercase', letterSpacing: '.5px' }}>Name</label>
        <input value={addFriendModal.name} onChange={e => patchAf({ name: e.target.value })} placeholder="e.g. Jordan Lee" style={{ width: '100%', marginTop: '6px', border: '1px solid #ECE2D6', borderRadius: '13px', padding: '12px 14px', fontSize: '15px', fontWeight: 600, outline: 'none', color: '#3A322C' }} />

        <label style={{ display: 'block', marginTop: '16px', fontSize: '12px', fontWeight: 800, color: '#9A8E83', textTransform: 'uppercase', letterSpacing: '.5px' }}>Description</label>
        <input value={addFriendModal.description} onChange={e => patchAf({ description: e.target.value })} placeholder="e.g. Remote dev \u00b7 free on weekends" style={{ width: '100%', marginTop: '6px', border: '1px solid #ECE2D6', borderRadius: '13px', padding: '12px 14px', fontSize: '15px', fontWeight: 600, outline: 'none', color: '#3A322C' }} />

        <label style={{ display: 'block', marginTop: '16px', fontSize: '12px', fontWeight: 800, color: '#9A8E83', textTransform: 'uppercase', letterSpacing: '.5px' }}>Timezone</label>
        <select
          value={addFriendModal.timezone || 'Africa/Accra'}
          onChange={e => patchAf({ timezone: e.target.value })}
          style={{ width: '100%', marginTop: '6px', border: '1px solid #ECE2D6', borderRadius: '13px', padding: '12px 14px', fontSize: '15px', fontWeight: 600, outline: 'none', color: '#3A322C', background: '#fff', cursor: 'pointer' }}
        >
          {COMMON_ZONES.map(tz => (
            <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px' }}>
          <div style={{ flex: 1 }} />
          <button style={{ border: '1px solid #ECE2D6', background: '#fff', color: '#6B5E52', borderRadius: '13px', padding: '12px 18px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }} onClick={closeAddFriend}>Cancel</button>
          <button style={{ border: 'none', background: '#E07A53', color: '#fff', borderRadius: '13px', padding: '12px 24px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }} onClick={saveNewFriend}>Add friend</button>
        </div>
      </div>
    </div>
  );
}
