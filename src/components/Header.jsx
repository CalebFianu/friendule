export default function Header({ tab, goFriends, goEveryone, auth, logout }) {
  const tabOn = { background: '#E07A53', color: '#fff', border: 'none', borderRadius: '999px', padding: '9px 18px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' };
  const tabOff = { background: 'transparent', color: '#8C7E70', border: 'none', borderRadius: '999px', padding: '9px 18px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '2px' }}>
          <span style={{ width: '30px', height: '30px', borderRadius: '999px', background: 'oklch(0.70 0.15 25)', boxShadow: '0 0 0 3.5px #FBF6F0,0 4px 10px -3px oklch(0.55 0.15 25 / .5)' }} />
          <span style={{ width: '30px', height: '30px', borderRadius: '999px', background: 'oklch(0.74 0.14 65)', boxShadow: '0 0 0 3.5px #FBF6F0,0 4px 10px -3px oklch(0.6 0.14 65 / .5)', marginLeft: '-11px' }} />
          <span style={{ width: '30px', height: '30px', borderRadius: '999px', background: 'oklch(0.66 0.12 245)', boxShadow: '0 0 0 3.5px #FBF6F0,0 4px 10px -3px oklch(0.5 0.12 245 / .5)', marginLeft: '-11px' }} />
        </div>
        <div>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: '26px', letterSpacing: '-.4px', lineHeight: 1 }}>Friendule</div>
          <div style={{ fontSize: '12.5px', color: '#9A8E83', fontWeight: 600, marginTop: '3px' }}>Know when your people are free.</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: '#fff', border: '1px solid #EFE7DD', borderRadius: '999px', padding: '4px' }}>
          <button style={tab === 'friends' ? tabOn : tabOff} onClick={goFriends}>Per friend</button>
          <button style={tab === 'everyone' ? tabOn : tabOff} onClick={goEveryone}>Everyone</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #EFE7DD', borderRadius: '999px', padding: '5px 13px 5px 5px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E07A53', color: '#fff', fontWeight: 800, fontSize: '12px', fontFamily: "'Quicksand',sans-serif", flexShrink: 0 }}>
            {auth.email[0].toUpperCase()}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#5A4F45', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {auth.email.length > 22 ? auth.email.substring(0, 22) + '\u2026' : auth.email}
          </span>
          <button style={{ background: 'none', border: 'none', padding: '0 0 0 8px', fontSize: '13px', color: '#A99C8F', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }} onClick={logout}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
