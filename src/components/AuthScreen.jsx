export default function AuthScreen({ authMode, authFields, authError, setAuthMode, setAuthFields, submitAuth }) {
  const tabOn = { flex: 1, border: 'none', borderRadius: '10px', padding: '10px 0', fontWeight: 800, fontSize: '14px', cursor: 'pointer', background: '#fff', color: '#3A322C', boxShadow: '0 1px 3px rgba(80,55,30,.16)', textAlign: 'center' };
  const tabOff = { flex: 1, border: 'none', borderRadius: '10px', padding: '10px 0', fontWeight: 800, fontSize: '14px', cursor: 'pointer', background: 'transparent', color: '#8C7E70', textAlign: 'center' };

  const onKeyDown = (e) => { if (e.key === 'Enter') submitAuth(); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#FBF6F0', backgroundImage: 'radial-gradient(900px 520px at 6% -12%, oklch(0.87 0.075 70 / .55), transparent 60%),radial-gradient(820px 520px at 100% -4%, oklch(0.85 0.085 28 / .42), transparent 56%)', backgroundAttachment: 'fixed' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px', animation: 'authslide .28s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '2px' }}>
          <span style={{ width: '28px', height: '28px', borderRadius: '999px', background: 'oklch(0.70 0.15 25)', boxShadow: '0 0 0 3px #FBF6F0,0 4px 10px -3px oklch(0.55 0.15 25 / .5)' }} />
          <span style={{ width: '28px', height: '28px', borderRadius: '999px', background: 'oklch(0.74 0.14 65)', boxShadow: '0 0 0 3px #FBF6F0,0 4px 10px -3px oklch(0.6 0.14 65 / .5)', marginLeft: '-10px' }} />
          <span style={{ width: '28px', height: '28px', borderRadius: '999px', background: 'oklch(0.66 0.12 245)', boxShadow: '0 0 0 3px #FBF6F0,0 4px 10px -3px oklch(0.5 0.12 245 / .5)', marginLeft: '-10px' }} />
        </div>
        <div>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: '24px', letterSpacing: '-.3px', lineHeight: 1 }}>Friendule</div>
          <div style={{ fontSize: '12px', color: '#9A8E83', fontWeight: 600, marginTop: '2px' }}>Know when your people are free.</div>
        </div>
      </div>

      <div style={{ width: '400px', maxWidth: '100%', background: '#fff', borderRadius: '28px', padding: '32px', boxShadow: '0 24px 60px rgba(58,42,28,.14)', border: '1px solid #EFE7DD', animation: 'authslide .32s .05s ease both', animationFillMode: 'both' }}>
        <div style={{ display: 'flex', background: '#F6EFE6', borderRadius: '13px', padding: '4px', marginBottom: '26px' }}>
          <button style={authMode === 'login' ? tabOn : tabOff} onClick={() => setAuthMode('login')}>Log in</button>
          <button style={authMode === 'register' ? tabOn : tabOff} onClick={() => setAuthMode('register')}>Create account</button>
        </div>

        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#9A8E83', textTransform: 'uppercase', letterSpacing: '.5px' }}>Email</label>
        <input value={authFields.email} onChange={e => setAuthFields({ email: e.target.value })} onKeyDown={onKeyDown} type="email" placeholder="you@example.com" style={{ width: '100%', marginTop: '6px', border: '1px solid #ECE2D6', borderRadius: '13px', padding: '13px 15px', fontSize: '15px', fontWeight: 600, outline: 'none', color: '#3A322C' }} />

        <label style={{ display: 'block', marginTop: '18px', fontSize: '12px', fontWeight: 800, color: '#9A8E83', textTransform: 'uppercase', letterSpacing: '.5px' }}>Password</label>
        <input value={authFields.password} onChange={e => setAuthFields({ password: e.target.value })} onKeyDown={onKeyDown} type="password" placeholder="At least 6 characters" style={{ width: '100%', marginTop: '6px', border: '1px solid #ECE2D6', borderRadius: '13px', padding: '13px 15px', fontSize: '15px', fontWeight: 600, outline: 'none', color: '#3A322C' }} />

        {authMode === 'register' && (
          <>
            <label style={{ display: 'block', marginTop: '18px', fontSize: '12px', fontWeight: 800, color: '#9A8E83', textTransform: 'uppercase', letterSpacing: '.5px' }}>Confirm password</label>
            <input value={authFields.confirm} onChange={e => setAuthFields({ confirm: e.target.value })} onKeyDown={onKeyDown} type="password" placeholder="Same password again" style={{ width: '100%', marginTop: '6px', border: '1px solid #ECE2D6', borderRadius: '13px', padding: '13px 15px', fontSize: '15px', fontWeight: 600, outline: 'none', color: '#3A322C' }} />
          </>
        )}

        {authError && (
          <div style={{ marginTop: '14px', background: '#FDF2F0', border: '1px solid #F0CAC2', borderRadius: '12px', padding: '11px 14px', fontSize: '13.5px', fontWeight: 700, color: '#C0563E' }}>{authError}</div>
        )}

        <button style={{ width: '100%', marginTop: '22px', border: 'none', background: '#E07A53', color: '#fff', borderRadius: '14px', padding: '15px', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }} onClick={submitAuth}>
          {authMode === 'login' ? 'Log in' : 'Create account'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#9A8E83', fontWeight: 600 }}>
          {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button style={{ background: 'none', border: 'none', padding: 0, color: '#E07A53', fontWeight: 800, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
            {authMode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
