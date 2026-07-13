import { Avatar, Badge, IconButton } from './ds.jsx';

export default function FriendSwitcher({ friend, friends, friendIdx, prevFriend, nextFriend, pickFriend, openAddFriend, instances }) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const todayY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayInst = instances(friend.id, todayY);
  const busyNow = todayInst.some(e => e.status === 'busy' && !e.allDay && nowMin >= e.startMin && nowMin < e.endMin)
                || todayInst.some(e => e.status === 'busy' && e.allDay);

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
      boxShadow: 'var(--shadow-md)',
    }}>
      {/* Prev */}
      <IconButton shape="circle" onClick={prevFriend} aria-label="Previous friend">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </IconButton>

      {/* Friend info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 220px', minWidth: 0 }}>
        {/* Large avatar using friend colorset */}
        <div style={{
          flex: '0 0 auto', width: 52, height: 52, borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: friend.colorset.tint,
          border: '1.5px solid ' + friend.colorset.tintBorder,
          fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)',
          fontSize: '18px', color: friend.colorset.deep,
        }}>
          {friend.initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-title)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {friend.name}
          </div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {friend.status}
          </div>
          <div style={{ marginTop: '7px' }}>
            <Badge tone={busyNow ? 'danger' : 'success'} dot>
              {busyNow ? 'Busy right now' : 'Free right now'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick-pick friend buttons */}
      <div style={{ flex: '1 1 auto', display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
        {friends.map((fr, i) => (
          <button
            key={fr.id}
            title={fr.name}
            onClick={() => pickFriend(i)}
            style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-xs)',
              cursor: 'pointer',
              background: i === friendIdx ? fr.colorset.solid : fr.colorset.tint,
              color: i === friendIdx ? '#fff' : fr.colorset.deep,
              border: '1.5px solid ' + (i === friendIdx ? fr.colorset.solid : fr.colorset.tintBorder),
              transform: i === friendIdx ? 'scale(1.08)' : 'none',
              boxShadow: i === friendIdx ? '0 4px 12px -4px ' + fr.colorset.solid : 'none',
              transition: 'all var(--dur-fast) var(--ease-out)',
            }}
          >{fr.initials}</button>
        ))}
        <button
          onClick={openAddFriend}
          style={{
            height: '36px', borderRadius: 'var(--radius-sm)',
            border: '1.5px dashed var(--border-strong)',
            background: 'var(--surface-sunken)',
            color: 'var(--text-tertiary)',
            fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)',
            cursor: 'pointer', padding: '0 12px', whiteSpace: 'nowrap',
            fontFamily: 'var(--font-sans)',
            transition: 'border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-brand)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
        >+ Add</button>
      </div>

      {/* Next */}
      <IconButton shape="circle" onClick={nextFriend} aria-label="Next friend">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </IconButton>
    </div>
  );
}
