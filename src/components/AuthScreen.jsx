import { Button, Input, SegmentedControl } from './ds.jsx';

export default function AuthScreen({ authMode, authFields, authError, setAuthMode, setAuthFields, submitAuth }) {
  const onKeyDown = e => { if (e.key === 'Enter') submitAuth(); };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      background: 'var(--bg-canvas)',
    }}>
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px', animation: 'authslide .28s ease both' }}>
        {/* Brand circles */}
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '2px' }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cat-rose-ink)', display: 'inline-block', boxShadow: '0 0 0 3px var(--bg-canvas), var(--shadow-sm)' }} />
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cat-amber-ink)', display: 'inline-block', marginLeft: -10, boxShadow: '0 0 0 3px var(--bg-canvas), var(--shadow-sm)' }} />
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', marginLeft: -10, boxShadow: '0 0 0 3px var(--bg-canvas), var(--shadow-sm)' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-extra)', fontSize: 'var(--fs-h2)', letterSpacing: 'var(--ls-tight)', lineHeight: 1, color: 'var(--text-primary)' }}>Friendule</div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--fw-medium)', marginTop: '3px' }}>Know when your people are free.</div>
        </div>
      </div>

      {/* Auth card */}
      <div style={{
        width: '400px', maxWidth: '100%',
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)',
        animation: 'authslide .32s .05s ease both',
        animationFillMode: 'both',
      }}>
        {/* Mode toggle */}
        <SegmentedControl
          options={[{ label: 'Log in', value: 'login' }, { label: 'Create account', value: 'register' }]}
          value={authMode}
          onChange={setAuthMode}
          style={{ width: '100%', marginBottom: '24px' }}
        />

        <label style={{ display: 'block', fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)' }}>
          Email
        </label>
        <Input
          value={authFields.email}
          onChange={e => setAuthFields({ email: e.target.value })}
          onKeyDown={onKeyDown}
          type="email"
          placeholder="you@example.com"
          wrapStyle={{ marginTop: '6px', width: '100%' }}
        />

        <label style={{ display: 'block', marginTop: '18px', fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)' }}>
          Password
        </label>
        <Input
          value={authFields.password}
          onChange={e => setAuthFields({ password: e.target.value })}
          onKeyDown={onKeyDown}
          type="password"
          placeholder="At least 6 characters"
          wrapStyle={{ marginTop: '6px', width: '100%' }}
        />

        {authMode === 'register' && (
          <>
            <label style={{ display: 'block', marginTop: '18px', fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)' }}>
              Confirm password
            </label>
            <Input
              value={authFields.confirm}
              onChange={e => setAuthFields({ confirm: e.target.value })}
              onKeyDown={onKeyDown}
              type="password"
              placeholder="Same password again"
              wrapStyle={{ marginTop: '6px', width: '100%' }}
            />
          </>
        )}

        {authError && (
          <div style={{
            marginTop: '14px',
            background: 'var(--cat-rose-fill)',
            border: '1px solid var(--cat-rose-ink)',
            borderRadius: 'var(--radius-md)',
            padding: '11px 14px',
            fontSize: 'var(--fs-sm)',
            fontWeight: 'var(--fw-semibold)',
            color: 'var(--cat-rose-ink)',
          }}>{authError}</div>
        )}

        <Button variant="primary" full size="lg" style={{ marginTop: '22px' }} onClick={submitAuth}>
          {authMode === 'login' ? 'Log in' : 'Create account'}
        </Button>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
          {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-brand)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-sm)', cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          >
            {authMode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
