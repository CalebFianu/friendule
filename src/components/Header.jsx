import { Avatar, SegmentedControl, IconButton } from './ds.jsx';

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
    </svg>
  );
}

export default function Header({ tab, goFriends, goEveryone, goPersonal, auth, logout, darkMode, toggleDark, lastAction, revertLastAction }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px', flexWrap: 'wrap', marginBottom: '24px',
      padding: '14px 18px',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xs)',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '2px' }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cat-rose-ink)', display: 'inline-block', boxShadow: '0 0 0 2.5px var(--surface-card)' }} />
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cat-amber-ink)', display: 'inline-block', marginLeft: -10, boxShadow: '0 0 0 2.5px var(--surface-card)' }} />
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', marginLeft: -10, boxShadow: '0 0 0 2.5px var(--surface-card)' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-extra)', fontSize: 'var(--fs-title)', letterSpacing: 'var(--ls-tight)', lineHeight: 1, color: 'var(--text-primary)' }}>Friendule</div>
          <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-tertiary)', fontWeight: 'var(--fw-medium)', marginTop: '2px', letterSpacing: 'var(--ls-normal)' }}>Know when your people are free.</div>
        </div>
      </div>

      {/* Nav + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <SegmentedControl
          options={[
            { label: 'My Calendar', value: 'personal' },
            { label: 'Per friend',  value: 'friends'  },
            { label: 'Everyone',    value: 'everyone' },
          ]}
          value={tab}
          onChange={v => {
            if (v === 'personal') goPersonal();
            else if (v === 'friends') goFriends();
            else goEveryone();
          }}
        />

        {/* Revert button */}
        <button
          onClick={revertLastAction}
          disabled={!lastAction}
          title={lastAction ? 'Undo last change' : 'Nothing to undo'}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 13px',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-pill)',
            background: lastAction ? 'var(--surface-card)' : 'var(--surface-sunken)',
            color: lastAction ? 'var(--text-secondary)' : 'var(--text-tertiary)',
            fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-sm)',
            cursor: lastAction ? 'pointer' : 'not-allowed',
            opacity: lastAction ? 1 : 0.5,
            transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
          }}
          onMouseEnter={e => { if (lastAction) e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={e => { if (lastAction) e.currentTarget.style.background = 'var(--surface-card)'; }}
        >
          <UndoIcon />
          Revert
        </button>

        {/* Dark mode toggle */}
        <IconButton
          variant={darkMode ? 'soft' : 'surface'}
          shape="circle"
          onClick={toggleDark}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </IconButton>

        {/* User chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--surface-sunken)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-pill)',
          padding: '4px 12px 4px 4px',
        }}>
          <Avatar name={auth.email} size={28} />
          <span style={{
            fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-semibold)',
            color: 'var(--text-primary)',
            maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {auth.email.length > 22 ? auth.email.substring(0, 22) + '\u2026' : auth.email}
          </span>
          <button
            style={{
              background: 'none', border: 'none', padding: '0 0 0 4px',
              fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)',
              cursor: 'pointer', fontWeight: 'var(--fw-medium)', fontFamily: 'inherit',
              transition: 'color var(--dur-fast) var(--ease-out)',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
            onClick={logout}
          >Sign out</button>
        </div>
      </div>
    </div>
  );
}
