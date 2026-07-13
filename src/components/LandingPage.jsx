import { useState, useEffect, useRef } from 'react';
import { Button, Badge } from './ds.jsx';
import AuthModal from './AuthModal.jsx';

/* ─── helpers ─── */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: `opacity .5s ${delay}s var(--ease-out), transform .5s ${delay}s var(--ease-out)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Mini Calendar Mockup ─── */
const MOCK_DAYS = [
  { n: 2,  dots: ['rose', 'amber'] },
  { n: 3,  dots: ['violet'] },
  { n: 4,  dots: [] },
  { n: 5,  dots: ['mint', 'blue', 'rose'], allFree: false },
  { n: 6,  dots: [] },
  { n: 7,  dots: ['amber', 'mint'], allFree: true },
  { n: 8,  dots: ['rose', 'violet'] },
  { n: 9,  dots: ['mint'] },
  { n: 10, dots: [] },
  { n: 11, dots: ['blue', 'amber'] },
  { n: 12, dots: [] },
  { n: 13, dots: [] },
  { n: 14, dots: ['rose'] },
];

const FRIENDS_DEMO = [
  { name: 'Maya',  color: 'var(--cat-rose-ink)',   fill: 'var(--cat-rose-fill)'   },
  { name: 'Leo',   color: 'var(--cat-amber-ink)',  fill: 'var(--cat-amber-fill)'  },
  { name: 'Priya', color: 'var(--cat-mint-ink)',   fill: 'var(--cat-mint-fill)'   },
  { name: 'Sam',   color: 'var(--cat-blue-ink)',   fill: 'var(--cat-blue-fill)'   },
  { name: 'Tariq', color: 'var(--cat-violet-ink)', fill: 'var(--cat-violet-fill)' },
];

function MiniCalendar() {
  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      padding: '20px',
      boxShadow: 'var(--shadow-lg)',
      width: '100%', maxWidth: 420,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-body)', color: 'var(--text-primary)' }}>
          July 2026
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {FRIENDS_DEMO.map(f => (
            <span key={f.name} title={f.name} style={{
              width: 26, height: 26, borderRadius: '50%',
              background: f.fill, color: f.color,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 9,
              border: '1.5px solid ' + f.color,
            }}>{f.name[0]}</span>
          ))}
        </div>
      </div>

      {/* Weekday labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {/* offset */}
        {[...Array(2)].map((_, i) => <div key={'e' + i} />)}
        {MOCK_DAYS.map(cell => (
          <div key={cell.n} style={{
            height: 44, borderRadius: 'var(--radius-sm)',
            background: cell.allFree ? 'var(--cat-mint-fill)' : 'var(--surface-card)',
            border: `1px solid ${cell.allFree ? 'var(--cat-mint-ink)' : 'var(--border-subtle)'}`,
            padding: '4px 3px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{
              textAlign: 'right',
              fontSize: 9, fontWeight: 700,
              color: cell.allFree ? 'var(--cat-mint-ink)' : 'var(--text-secondary)',
            }}>{cell.n}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {cell.dots.map((cat, i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: `var(--cat-${cat}-ink)`, display: 'inline-block' }} />
              ))}
              {cell.allFree && <span style={{ fontSize: 7, fontWeight: 700, color: 'var(--cat-mint-ink)' }}>free!</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Legend strip */}
      <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
        {FRIENDS_DEMO.map(f => (
          <span key={f.name} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 600, color: f.color,
            background: f.fill, borderRadius: 999, padding: '2px 7px',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: f.color, display: 'inline-block' }} />
            {f.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Voice Demo ─── */
function VoiceDemo() {
  const [step, setStep] = useState(0);
  const phrases = [
    { text: 'Busy weekdays 9–5', result: 'Mon–Fri · 9:00 – 17:00 · Busy' },
    { text: 'Free this Saturday',  result: 'Sat Jul 12 · All day · Free' },
    { text: 'Gym Mon & Wed 7am',   result: 'Mon, Wed · 7:00 – 8:00 · Busy' },
  ];
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % phrases.length), 3000);
    return () => clearInterval(t);
  }, [phrases.length]);

  const p = phrases[step];

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Input row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--surface-sunken)',
        border: '1px solid var(--border-brand)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 12px',
        marginBottom: 10,
        boxShadow: `0 0 0 3px var(--accent-wash)`,
      }}>
        {/* Mic icon */}
        <div style={{
          width: 28, height: 28, borderRadius: 'var(--radius-sm)',
          background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
          </svg>
        </div>
        <span key={step} style={{
          fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-primary)', flex: 1,
          animation: 'flin .3s ease both',
        }}>
          {p.text}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-2xs)', color: 'var(--text-tertiary)' }}>●●●</span>
      </div>

      {/* Parsed result */}
      <div key={'r' + step} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
        background: 'var(--cat-mint-fill)',
        border: '1px solid var(--cat-mint-ink)',
        borderRadius: 'var(--radius-sm)',
        animation: 'flin .35s .1s ease both',
        animationFillMode: 'both',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cat-mint-ink)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--cat-mint-ink)', fontWeight: 600 }}>{p.result}</span>
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
        {phrases.map((_, i) => (
          <span key={i} style={{ width: i === step ? 16 : 6, height: 4, borderRadius: 999, background: i === step ? 'var(--accent)' : 'var(--border-strong)', transition: 'width .3s var(--ease-out), background .3s' }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Feature Cards ─── */
const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    cat: 'violet',
    title: 'Friend calendars',
    desc: 'Track each friend\'s schedule individually. See their week at a glance — who\'s slammed, who\'s got pockets of time.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    cat: 'blue',
    title: 'Group view',
    desc: 'See everyone\'s availability on one calendar. Color-coded dots highlight busy days, and "all free" badges surface perfect windows.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    cat: 'mint',
    title: 'Smart scheduling',
    desc: 'Friendule scans the next two weeks and surfaces the best time when the most people are free — no back-and-forth needed.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    cat: 'rose',
    title: 'Conflict detection',
    desc: 'Automatically flags when a friend\'s schedule has overlapping busy and free times, so you always have clean data.',
  },
];

/* ─── Steps ─── */
const STEPS = [
  { n: '01', title: 'Add your people', desc: 'Add friends with their timezone. Friendule keeps track of who they are and where they\'re based.' },
  { n: '02', title: 'Describe their schedule', desc: 'Type or speak naturally: "Busy weekdays 9–5" or "Free this Saturday." Claude AI parses it instantly.' },
  { n: '03', title: 'Find the perfect time', desc: 'Jump to the Everyone view. Color dots and smart insights show you exactly when everyone can meet up.' },
];

/* ─── Nav ─── */
function Nav({ onLogin, onSignup, darkMode, toggleDark }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(16px, 4vw, 48px)',
      height: 62,
      background: scrolled ? 'color-mix(in srgb, var(--surface-card) 90%, transparent)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
      transition: 'background .3s var(--ease-out), border-color .3s var(--ease-out), backdrop-filter .3s',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--cat-rose-ink)', display: 'inline-block' }} />
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--cat-amber-ink)', display: 'inline-block', marginLeft: -8 }} />
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', marginLeft: -8 }} />
        </div>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-extra)', fontSize: 'var(--fs-title)', letterSpacing: 'var(--ls-tight)', color: 'var(--text-primary)' }}>
          Friendule
        </span>
      </div>

      {/* Links + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <a href="#features" style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-medium)', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 12px', borderRadius: 'var(--radius-md)', transition: 'color .15s, background .15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
        >Features</a>
        <a href="#how-it-works" style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-medium)', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 12px', borderRadius: 'var(--radius-md)', transition: 'color .15s, background .15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
        >How it works</a>

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          title={darkMode ? 'Light mode' : 'Dark mode'}
          style={{
            width: 34, height: 34, border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', background: 'var(--surface-card)',
            color: 'var(--text-secondary)', cursor: 'pointer', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            transition: 'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-card)'}
        >
          {darkMode
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>

        <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 2px' }} />

        <Button variant="ghost" size="sm" onClick={onLogin}>Log in</Button>
        <Button variant="primary" size="sm" onClick={onSignup}>Get started</Button>
      </div>
    </nav>
  );
}

/* ─── LANDING PAGE ─── */
export default function LandingPage({ authMode, authFields, authError, setAuthMode, setAuthFields, submitAuth, darkMode, toggleDark }) {
  const [modalOpen, setModalOpen] = useState(false);

  const openLogin  = () => { setAuthMode('login');    setModalOpen(true); };
  const openSignup = () => { setAuthMode('register'); setModalOpen(true); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', fontFamily: 'var(--font-sans)' }}>
      <Nav onLogin={openLogin} onSignup={openSignup} darkMode={darkMode} toggleDark={toggleDark} />

      {/* ── HERO ── */}
      <section style={{
        maxWidth: 1160, margin: '0 auto',
        padding: 'clamp(100px,14vw,160px) clamp(16px,4vw,48px) clamp(60px,8vw,100px)',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center',
      }}
        className="hero-grid"
      >
        {/* Left copy */}
        <div>
          <div style={{ animation: 'flin .4s .05s ease both', animationFillMode: 'both' }}>
            <Badge tone="brand" style={{ marginBottom: 20 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 2 }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Powered by Claude AI
            </Badge>
          </div>

          <h1 style={{
            font: 'var(--text-display)', letterSpacing: 'var(--ls-tight)',
            color: 'var(--text-primary)', margin: '0 0 20px',
            animation: 'flin .45s .1s ease both', animationFillMode: 'both',
          }}>
            Know when your<br />
            <span style={{ color: 'var(--accent)' }}>people are free.</span>
          </h1>

          <p style={{
            fontSize: 'var(--fs-title)', color: 'var(--text-secondary)',
            lineHeight: 'var(--lh-snug)', margin: '0 0 36px', maxWidth: 460,
            animation: 'flin .45s .18s ease both', animationFillMode: 'both',
          }}>
            Add your friends, describe their schedules in plain English, and Friendule shows you the perfect time to hang out — no group chats, no back-and-forth.
          </p>

          <div style={{
            display: 'flex', gap: 12, flexWrap: 'wrap',
            animation: 'flin .45s .26s ease both', animationFillMode: 'both',
          }}>
            <Button variant="primary" size="lg" onClick={openSignup}>Get started free</Button>
            <Button variant="secondary" size="lg" onClick={openLogin}>Log in</Button>
          </div>

          {/* Social proof chips */}
          <div style={{
            display: 'flex', gap: 20, marginTop: 36, flexWrap: 'wrap',
            animation: 'flin .45s .34s ease both', animationFillMode: 'both',
          }}>
            {[
              { icon: '🗓', label: 'Month & week views' },
              { icon: '🌍', label: 'Timezone-aware' },
              { icon: '🔒', label: 'Private by default' },
            ].map(({ icon, label }) => (
              <span key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--fw-medium)',
              }}>
                <span>{icon}</span> {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: calendar mockup */}
        <div style={{ display: 'flex', justifyContent: 'center', animation: 'flin .55s .2s ease both', animationFillMode: 'both' }}>
          <MiniCalendar />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ maxWidth: 1160, margin: '0 auto', padding: 'clamp(40px,8vw,80px) clamp(16px,4vw,48px)' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <Badge tone="brand" style={{ marginBottom: 14 }}>Features</Badge>
            <h2 style={{ font: 'var(--text-h2)', letterSpacing: 'var(--ls-tight)', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Everything you need to coordinate
            </h2>
            <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
              Built around one goal: making it effortless to find time with the people you care about.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <div style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)',
                height: '100%',
                transition: 'box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: `var(--cat-${f.cat}-fill)`,
                  color: `var(--cat-${f.cat}-ink)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>{f.icon}</div>
                <div style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-title)', color: 'var(--text-primary)', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-snug)' }}>{f.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── AI + VOICE HIGHLIGHT ── */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: 'clamp(40px,8vw,80px) clamp(16px,4vw,48px)' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center',
        }}>
          {/* Left: demo */}
          <FadeIn>
            <div>
              <div style={{
                background: 'linear-gradient(135deg, var(--violet-500), var(--violet-700))',
                borderRadius: 'var(--radius-xl)',
                padding: '36px 32px',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
                <div style={{ position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />

                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)', letterSpacing: 'var(--ls-caps)', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', marginBottom: 6 }}>Voice &amp; text input</div>
                  <div style={{ font: 'var(--text-h3)', color: '#fff', marginBottom: 14 }}>Just say it out loud</div>
                  <div style={{ fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,.8)', lineHeight: 'var(--lh-snug)', marginBottom: 24 }}>
                    Tap the mic and speak naturally. Groq Whisper transcribes your voice in real time, then Claude AI parses your intent — no forms, no dropdowns.
                  </div>
                  <VoiceDemo />
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right: copy */}
          <FadeIn delay={0.1}>
            <div>
              <Badge tone="brand" style={{ marginBottom: 16 }}>AI-powered</Badge>
              <h2 style={{ font: 'var(--text-h2)', letterSpacing: 'var(--ls-tight)', color: 'var(--text-primary)', margin: '0 0 16px' }}>
                Schedules in plain English
              </h2>
              <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-normal)', marginBottom: 28 }}>
                Forget complex forms. Just type or say something like <em>&ldquo;Busy weekdays 9–5&rdquo;</em> and Friendule handles the rest — creating weekly recurring rules, one-off blocks, or removing old entries.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: '⌨', text: 'Type naturally — "Free this weekend", "Remove gym"' },
                  { icon: '🎤', text: 'Speak it instead — voice transcription via Groq Whisper' },
                  { icon: '🤖', text: 'Claude AI parses complex schedules and asks if anything\'s unclear' },
                  { icon: '🔁', text: 'Once, daily, or weekly rules — all from one sentence' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                      background: 'var(--surface-inset)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14,
                    }}>{icon}</span>
                    <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-snug)', paddingTop: 6 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{
        maxWidth: 1160, margin: '0 auto',
        padding: 'clamp(40px,8vw,80px) clamp(16px,4vw,48px)',
      }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <Badge tone="info" style={{ marginBottom: 14 }}>How it works</Badge>
            <h2 style={{ font: 'var(--text-h2)', letterSpacing: 'var(--ls-tight)', color: 'var(--text-primary)', margin: 0 }}>
              Up and running in minutes
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, position: 'relative' }}>
          {STEPS.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.1}>
              <div style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px 24px',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-h1)',
                  fontWeight: 'var(--fw-extra)', color: 'var(--border-strong)',
                  letterSpacing: 'var(--ls-tight)', marginBottom: 16,
                }}>{s.n}</div>
                <div style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-title)', color: 'var(--text-primary)', marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-snug)' }}>{s.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: 'clamp(40px,6vw,60px) clamp(16px,4vw,48px) clamp(60px,10vw,100px)' }}>
        <FadeIn>
          <div style={{
            background: 'linear-gradient(135deg, var(--violet-500), var(--violet-800))',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(40px,6vw,64px)',
            textAlign: 'center',
            position: 'relative', overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ position: 'absolute', top: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
            <div style={{ position: 'absolute', bottom: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: -8, marginBottom: 20 }}>
                {FRIENDS_DEMO.map((f, i) => (
                  <span key={f.name} style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: f.color, color: '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 14,
                    boxShadow: '0 0 0 3px var(--violet-700)',
                    marginLeft: i === 0 ? 0 : -10,
                    position: 'relative', zIndex: i,
                  }}>{f.name[0]}</span>
                ))}
              </div>
              <h2 style={{ font: 'var(--text-h2)', color: '#fff', margin: '0 0 14px', letterSpacing: 'var(--ls-tight)' }}>
                Start coordinating today
              </h2>
              <p style={{ fontSize: 'var(--fs-body)', color: 'rgba(255,255,255,.8)', marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' }}>
                Free to use. No credit card. Just add your friends and stop missing each other.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  size="lg"
                  style={{ background: '#fff', color: 'var(--accent)', boxShadow: 'var(--shadow-md)' }}
                  onClick={openSignup}
                >Get started free</Button>
                <Button
                  size="lg"
                  style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.3)' }}
                  onClick={openLogin}
                >Log in</Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: 'clamp(20px,4vw,32px) clamp(16px,4vw,48px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        maxWidth: 1160, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--cat-rose-ink)', display: 'inline-block' }} />
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--cat-amber-ink)', display: 'inline-block', marginLeft: -6 }} />
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', marginLeft: -6 }} />
          </div>
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-sm)', color: 'var(--text-primary)' }}>Friendule</span>
        </div>
        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
          Know when your people are free.
        </div>
      </footer>

      {/* Responsive hero grid */}
      <style>{`
        @media (max-width: 760px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 700px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Auth modal */}
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        authMode={authMode}
        authFields={authFields}
        authError={authError}
        setAuthMode={setAuthMode}
        setAuthFields={setAuthFields}
        submitAuth={submitAuth}
      />
    </div>
  );
}
