export default function FriendSwitcher({ friend, friends, friendIdx, prevFriend, nextFriend, pickFriend, openAddFriend, instances }) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const todayY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayInst = instances(friend.id, todayY);
  const busyNow = todayInst.some(e => e.status === 'busy' && !e.allDay && nowMin >= e.startMin && nowMin < e.endMin) || todayInst.some(e => e.status === 'busy' && e.allDay);

  const avatarStyle = {
    flex: '0 0 auto', width: '56px', height: '56px', borderRadius: '18px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: friend.colorset.tint, color: friend.colorset.deep,
    border: '1.5px solid ' + friend.colorset.tintBorder,
    fontWeight: 800, fontSize: '20px', fontFamily: "'Quicksand',sans-serif"
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #EFE7DD', borderRadius: '22px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', boxShadow: '0 18px 40px -24px rgba(120,75,40,.32)' }}>
      <button style={{ flex: '0 0 auto', width: '42px', height: '42px', borderRadius: '999px', border: '1px solid #EFE7DD', background: '#FBF6F0', color: '#6B5E52', fontSize: '20px', cursor: 'pointer', fontWeight: 700 }} onClick={prevFriend}>&lsaquo;</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 220px', minWidth: 0 }}>
        <div style={avatarStyle}>{friend.initials}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: '21px', lineHeight: 1.1 }}>{friend.name}</div>
          <div style={{ fontSize: '13.5px', color: '#9A8E83', fontWeight: 600, marginTop: '2px' }}>{friend.status}</div>
          <div style={{ marginTop: '7px' }}>
            <span style={busyNow
              ? { background: '#FBEDE7', color: '#C0563E', fontWeight: 800, fontSize: '12px', padding: '4px 11px', borderRadius: '999px' }
              : { background: '#EAF6EC', color: '#4F9A60', fontWeight: 800, fontSize: '12px', padding: '4px 11px', borderRadius: '999px' }
            }>{busyNow ? 'Busy right now' : 'Free right now'}</span>
          </div>
        </div>
      </div>
      <div style={{ flex: '1 1 auto', display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
        {friends.map((fr, i) => (
          <button key={fr.id} title={fr.name} onClick={() => pickFriend(i)} style={{
            width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '13px', cursor: 'pointer', fontFamily: "'Quicksand',sans-serif",
            background: i === friendIdx ? fr.colorset.solid : fr.colorset.tint,
            color: i === friendIdx ? '#fff' : fr.colorset.deep,
            border: '1.5px solid ' + (i === friendIdx ? fr.colorset.solid : fr.colorset.tintBorder),
            transform: i === friendIdx ? 'scale(1.08)' : 'none',
            boxShadow: i === friendIdx ? '0 7px 16px -6px ' + fr.colorset.solid : 'none',
            transition: 'all .15s'
          }}>{fr.initials}</button>
        ))}
        <button style={{ flex: '0 0 auto', height: '38px', borderRadius: '12px', border: '1.5px dashed #D4C4B4', background: '#FBF6F0', color: '#9A8E83', fontSize: '13px', fontWeight: 800, cursor: 'pointer', padding: '0 13px', whiteSpace: 'nowrap' }} onClick={openAddFriend}>+ Add</button>
      </div>
      <button style={{ flex: '0 0 auto', width: '42px', height: '42px', borderRadius: '999px', border: '1px solid #EFE7DD', background: '#FBF6F0', color: '#6B5E52', fontSize: '20px', cursor: 'pointer', fontWeight: 700 }} onClick={nextFriend}>&rsaquo;</button>
    </div>
  );
}
