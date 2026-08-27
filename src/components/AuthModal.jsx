import { Button, Input, SegmentedControl } from './ds.jsx';

export default function AuthModal({ isOpen, onClose, authMode, authFields, authError, setAuthMode, setAuthFields, submitAuth }) {
  if (!isOpen) return null;

  const onKeyDown = e => { if (e.key === 'Enter') submitAuth(); };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(16,16,25,.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '18px', zIndex: 200,
        animation: 'ovin .2s ease both',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '400px', maxWidth: '100%',
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
          animation: 'pop .24s cubic-bezier(.2,.8,.3,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-h3)', color: 'var(--text-primary)' }}>
              {authMode === 'login' ? 'Welcome back' : 'Create account'}
            </div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {authMode === 'login' ? 'Log in to your Friendule account.' : 'Get started — it\'s free.'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 'var(--radius-pill)',
              border: 'none', background: 'var(--surface-inset)',
              color: 'var(--text-secondary)', fontSize: 16, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background var(--dur-fast)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-inset)'}
          >&#10005;</button>
        </div>

        {/* Mode tabs */}
        <SegmentedControl
          options={[{ label: 'Log in', value: 'login' }, { label: 'Sign up', value: 'register' }]}
          value={authMode}
          onChange={setAuthMode}
          style={{ marginBottom: '20px' }}
        />

        <label style={{ display: 'block', fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)' }}>Email</label>
        <Input
          value={authFields.email}
          onChange={e => setAuthFields({ email: e.target.value })}
          onKeyDown={onKeyDown}
          type="email"
          placeholder="you@example.com"
          wrapStyle={{ marginTop: '6px', width: '100%' }}
        />

        <label style={{ display: 'block', marginTop: '16px', fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)' }}>Password</label>
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
            <label style={{ display: 'block', marginTop: '16px', fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)' }}>Confirm password</label>
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
            marginTop: '14px', background: 'var(--cat-rose-fill)',
            border: '1px solid var(--cat-rose-ink)', borderRadius: 'var(--radius-md)',
            padding: '11px 14px', fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--cat-rose-ink)',
          }}>{authError}</div>
        )}

        <Button variant="primary" full size="lg" style={{ marginTop: '20px' }} onClick={submitAuth}>
          {authMode === 'login' ? 'Log in' : 'Create account'}
        </Button>

        <div style={{ textAlign: 'center', marginTop: '14px', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
          {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-brand)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-sm)', cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          >
            {authMode === 'login' ? 'Sign up free' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
