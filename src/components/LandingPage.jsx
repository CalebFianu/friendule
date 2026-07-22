import { useState, useEffect, useRef } from 'react';
import { Button } from './ds.jsx';
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
        transform: visible ? 'none' : 'translateY(18px)',
        transition: `opacity .5s ${delay}s var(--ease-out), transform .5s ${delay}s var(--ease-out)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Section tag (monospace label) ─── */
function SectionTag({ children, color = 'var(--accent)' }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 600,
      color, textTransform: 'uppercase', letterSpacing: '0.1em',
      marginBottom: 14,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: color, display: 'inline-block', flexShrink: 0,
      }} />
      {children}
    </div>
  );
}

/* ─── Mini Calendar Mockup ─── */
const MOCK_DAYS = [
  { n: 2,  dots: ['rose', 'amber'] },
  { n: 3,  dots: ['violet'] },
  { n: 4,  dots: [] },
  { n: 5,  dots: ['mint', 'blue', 'rose'] },
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
      borderRadius: 16,
      padding: '20px',
      boxShadow: 'var(--shadow-lg)',
      width: '100%', maxWidth: 400,
      position: 'relative',
    }}>
      {/* Accent corner tab */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 40, height: 40, borderRadius: '16px 0 12px 0',
        background: 'var(--accent-wash)',
        borderRight: '1px solid var(--accent)',
        borderBottom: '1px solid var(--accent)',
        opacity: 0.7,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12,
          color: 'var(--text-primary)', letterSpacing: '0.02em',
        }}>
          July&nbsp;·&nbsp;2026
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {FRIENDS_DEMO.map(f => (
            <span key={f.name} title={f.name} style={{
              width: 22, height: 22, borderRadius: '50%',
              background: f.fill, color: f.color,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 7,
              border: '1.5px solid ' + f.color,
            }}>{f.name[0]}</span>
          ))}
        </div>
      </div>

      {/* Weekday labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 3 }}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} style={{
            textAlign: 'center', fontSize: 7, fontWeight: 700,
            color: 'var(--text-tertiary)', textTransform: 'uppercase',
            letterSpacing: '0.05em', fontFamily: 'var(--font-mono)',
          }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {[...Array(2)].map((_, i) => <div key={'e' + i} />)}
        {MOCK_DAYS.map(cell => (
          <div key={cell.n} style={{
            height: 38, borderRadius: 7,
            background: cell.allFree ? 'var(--cat-mint-fill)' : 'var(--surface-card)',
            border: `1px solid ${cell.allFree ? 'var(--cat-mint-ink)' : 'var(--border-subtle)'}`,
            padding: '3px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{
              textAlign: 'right', fontSize: 7, fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: cell.allFree ? 'var(--cat-mint-ink)' : 'var(--text-tertiary)',
            }}>{cell.n}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, paddingLeft: 1 }}>
              {cell.dots.map((cat, i) => (
                <span key={i} style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: `var(--cat-${cat}-ink)`, display: 'inline-block',
                }} />
              ))}
              {cell.allFree && (
                <span style={{
                  fontSize: 5, fontWeight: 700,
                  color: 'var(--cat-mint-ink)', fontFamily: 'var(--font-mono)',
                }}>free!</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 5, marginTop: 12, flexWrap: 'wrap' }}>
        {FRIENDS_DEMO.map(f => (
          <span key={f.name} style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 8, fontWeight: 600, color: f.color,
            fontFamily: 'var(--font-mono)',
            background: f.fill, borderRadius: 999, padding: '2px 6px',
          }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: f.color, display: 'inline-block' }} />
            {f.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── AI Parser Demo (terminal style) ─── */
function ParserDemo() {
  const [step, setStep] = useState(0);
  const phrases = [
    { text: 'Busy weekdays 9–5', result: 'Mon–Fri · 9:00 – 17:00 · Busy' },
    { text: 'Free this Saturday', result: 'Sat Jul 12 · All day · Free'    },
    { text: 'Gym Mon & Wed 7am',  result: 'Mon, Wed · 7:00 – 8:00 · Busy'  },
  ];
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % phrases.length), 3000);
    return () => clearInterval(t);
  }, [phrases.length]);

  const p = phrases[step];
  return (
    <div style={{
      background: 'rgba(0,0,0,.22)',
      border: '1px solid rgba(255,255,255,.10)',
      borderRadius: 12, padding: 16,
    }}>
      {/* Terminal title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
          color: 'rgba(255,255,255,.3)', marginLeft: 6,
        }}>friendule — ai parser</span>
      </div>

      {/* Input line */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(255,255,255,.06)',
        border: '1px solid rgba(255,255,255,.10)',
        borderRadius: 8, padding: '9px 12px', marginBottom: 10,
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(255,255,255,.3)' }}>$</span>
        <span key={step} style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
          color: 'rgba(255,255,255,.88)', flex: 1,
          animation: 'flin .3s ease both',
        }}>{p.text}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,.3)' }}>▋</span>
      </div>

      {/* Parsed output */}
      <div key={'r' + step} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
        background: 'rgba(31,143,104,.15)',
        border: '1px solid rgba(31,143,104,.3)',
        borderRadius: 8,
        animation: 'flin .35s .1s ease both',
        animationFillMode: 'both',
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(31,143,104,.9)" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
          color: 'rgba(31,143,104,.95)', fontWeight: 600,
        }}>{p.result}</span>
      </div>

      {/* Step dots */}
      <div style={{ marginTop: 10, display: 'flex', gap: 4 }}>
        {phrases.map((_, i) => (
          <span key={i} style={{
            width: i === step ? 14 : 4, height: 3, borderRadius: 999,
            background: i === step ? 'rgba(255,255,255,.65)' : 'rgba(255,255,255,.18)',
            transition: 'width .3s var(--ease-out), background .3s',
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Personal Schedule Mockup ─── */
const MY_EVENTS = [
  { day: 'Mon', date: 14, events: [{ label: 'Work', cat: 'amber', time: '9–5' }] },
  { day: 'Tue', date: 15, events: [{ label: 'Work', cat: 'amber', time: '9–5' }, { label: 'Gym', cat: 'rose', time: '7pm' }] },
  { day: 'Wed', date: 16, events: [{ label: 'Free afternoon', cat: 'mint', time: '' }], highlight: true },
  { day: 'Thu', date: 17, events: [{ label: 'Work', cat: 'amber', time: '9–5' }] },
  { day: 'Fri', date: 18, events: [{ label: 'Work', cat: 'amber', time: '9–5' }, { label: 'Dentist', cat: 'blue', time: '3pm' }] },
  { day: 'Sat', date: 19, events: [], freeAll: true },
  { day: 'Sun', date: 20, events: [{ label: 'Family dinner', cat: 'violet', time: '6pm' }] },
];

function PersonalScheduleMockup() {
  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 20, padding: '22px',
      boxShadow: 'var(--shadow-lg)',
      width: '100%', maxWidth: 400,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 14, flexShrink: 0,
        }}>Y</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>My Calendar</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 1 }}>July 14 – 20, 2026</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            background: 'var(--cat-mint-fill)', color: 'var(--cat-mint-ink)',
            borderRadius: 999, padding: '3px 9px',
            fontSize: '0.68rem', fontWeight: 600,
          }}>2 free days</span>
        </div>
      </div>

      {/* Day rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {MY_EVENTS.map(row => (
          <div key={row.day} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 10,
            background: row.freeAll ? 'var(--cat-mint-fill)' : row.highlight ? 'var(--accent-wash)' : 'transparent',
            border: `1px solid ${row.freeAll ? 'var(--cat-mint-ink)' : row.highlight ? 'var(--accent)' : 'var(--border-subtle)'}`,
          }}>
            {/* Day label */}
            <div style={{ width: 48, flexShrink: 0 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: row.freeAll ? 'var(--cat-mint-ink)' : 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.day}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: row.freeAll ? 'var(--cat-mint-ink)' : 'var(--text-primary)' }}>{row.date}</div>
            </div>

            {/* Events */}
            <div style={{ display: 'flex', gap: 5, flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              {row.freeAll ? (
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--cat-mint-ink)',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Free all day
                </span>
              ) : row.events.length === 0 ? (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>nothing scheduled</span>
              ) : (
                row.events.map(ev => (
                  <span key={ev.label} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: `var(--cat-${ev.cat}-fill)`,
                    color: `var(--cat-${ev.cat}-ink)`,
                    borderRadius: 6, padding: '2px 7px',
                    fontSize: '0.7rem', fontWeight: 600,
                  }}>
                    {ev.label}{ev.time ? ` · ${ev.time}` : ''}
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Heart Cursor ─── */
function HeartCursor({ containerRef }) {
  const cursorRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    const cursor = cursorRef.current;
    if (!el || !cursor) return;

    const onMove = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top  = `${e.clientY}px`;
      cursor.style.opacity = '1';
    };
    const onLeave = () => { cursor.style.opacity = '0'; };

    el.addEventListener('mousemove', onMove, { passive: true });
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [containerRef]);

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none', zIndex: 9999,
        opacity: 0, transition: 'opacity 150ms ease',
        willChange: 'left, top',
      }}
    >
      <div className="ptr-heart-wrap">
        <svg
          width="36" height="36" viewBox="0 0 24 22" fill="none"
          style={{ color: 'var(--cat-rose-ink)', display: 'block',
            filter: 'drop-shadow(0 2px 6px color-mix(in srgb, var(--cat-rose-ink) 40%, transparent))',
          }}
        >
          <path
            className="ptr-heart-fill"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}

/* ─── Feature cards ─── */
const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    cat: 'violet',
    title: 'Friend calendars',
    desc: 'Track each friend\'s schedule individually. See their week at a glance — who\'s slammed, who has pockets of time.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    cat: 'blue',
    title: 'Group view',
    desc: 'See everyone\'s availability on one calendar. Color-coded dots highlight busy days and surface perfect windows.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    cat: 'mint',
    title: 'Smart scheduling',
    desc: 'Friendule scans the next two weeks and surfaces the best time when the most people are free — no back-and-forth.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  { n: '01', title: 'Add your crew', desc: 'Add your friends and where they\'re based. Each one gets their own color so you can tell them apart at a glance.' },
  { n: '02', title: 'Tell it their schedule', desc: 'Just type something like "Busy weekdays 9–5" or "Free this Saturday" and Friendule figures out the rest.' },
  { n: '03', title: 'See when to hang', desc: 'Flip to the group view. You\'ll immediately see which days light up green — that\'s your window.' },
];

/* ─── Nav ─── */
function Nav({ onLogin, onSignup, darkMode, toggleDark }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(16px, 4vw, 48px)',
      height: 60,
      background: scrolled
        ? 'color-mix(in srgb, var(--surface-card) 88%, transparent)'
        : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
      transition: 'background .3s var(--ease-out), border-color .3s, backdrop-filter .3s',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--cat-rose-ink)', display: 'inline-block' }} />
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--cat-amber-ink)', display: 'inline-block', marginLeft: -7 }} />
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', marginLeft: -7 }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-sans)', fontWeight: 800,
          fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)',
        }}>Friendule</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <a href="#features"
          style={{
            fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '0.825rem',
            color: 'var(--text-secondary)', textDecoration: 'none',
            padding: '6px 11px', borderRadius: 10,
            transition: 'color .15s, background .15s', cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
        >Features</a>
        <a href="#how-it-works"
          style={{
            fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '0.825rem',
            color: 'var(--text-secondary)', textDecoration: 'none',
            padding: '6px 11px', borderRadius: 10,
            transition: 'color .15s, background .15s', cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
        >How it works</a>

        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 34, height: 34, border: '1px solid var(--border-subtle)',
            borderRadius: 10, background: 'var(--surface-card)',
            color: 'var(--text-secondary)', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .15s', marginLeft: 4,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-card)'}
        >
          {darkMode
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>

        <div style={{ width: 1, height: 18, background: 'var(--border-subtle)', margin: '0 4px' }} />

        <Button variant="ghost" size="sm" onClick={onLogin}
          style={{ fontSize: '0.825rem', height: 34, padding: '0 13px' }}
        >Log in</Button>
        <Button variant="primary" size="sm" onClick={onSignup}
          style={{ fontSize: '0.825rem', height: 34, padding: '0 14px' }}
        >Get started</Button>
      </div>
    </nav>
  );
}

/* ─── Chip (replaces emoji + text) ─── */
function Chip({ icon, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500,
      fontFamily: 'var(--font-sans)',
    }}>
      <span style={{
        width: 24, height: 24, borderRadius: 7,
        background: 'var(--surface-inset)',
        border: '1px solid var(--border-subtle)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-secondary)', flexShrink: 0,
      }}>{icon}</span>
      {label}
    </span>
  );
}

/* ─── LANDING PAGE ─── */
export default function LandingPage({ authMode, authFields, authError, setAuthMode, setAuthFields, submitAuth, darkMode, toggleDark }) {
  const [modalOpen, setModalOpen] = useState(false);
  const rootRef = useRef(null);

  const openLogin  = () => { setAuthMode('login');    setModalOpen(true); };
  const openSignup = () => { setAuthMode('register'); setModalOpen(true); };

  return (
    <div ref={rootRef} className="lp-root" style={{ minHeight: '100vh', background: 'var(--bg-canvas)', fontFamily: 'var(--font-sans)', position: 'relative' }}>

      <HeartCursor containerRef={rootRef} />

      {/* Dot grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(circle, var(--text-tertiary) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        opacity: 0.15,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Nav onLogin={openLogin} onSignup={openSignup} darkMode={darkMode} toggleDark={toggleDark} />

        {/* Hero ambient glow */}
        <div style={{
          position: 'absolute', top: '10vh', left: '50%',
          transform: 'translateX(-50%)',
          width: 'clamp(500px, 80vw, 900px)', height: 'clamp(300px, 40vh, 500px)',
          background: 'radial-gradient(ellipse, var(--accent-wash) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
          filter: 'blur(40px)',
        }} />

        {/* ── HERO ── */}
        <section style={{
          maxWidth: 1160, margin: '0 auto',
          padding: 'clamp(108px,14vw,164px) clamp(16px,4vw,48px) clamp(64px,8vw,100px)',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 'clamp(32px,5vw,72px)', alignItems: 'center',
        }} className="lp-hero-grid">

          {/* Left copy */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-sans)', fontWeight: 800,
              fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.08,
              letterSpacing: '-0.03em', color: 'var(--text-primary)',
              margin: '0 0 20px',
              animation: 'flin .45s .05s ease both', animationFillMode: 'both',
            }}>
              Know when your<br />
              <span style={{ color: 'var(--accent)' }}>people are free.</span>
            </h1>

            <p style={{
              fontSize: '1.0625rem', color: 'var(--text-secondary)',
              lineHeight: 1.6, margin: '0 0 36px', maxWidth: 440,
              animation: 'flin .45s .13s ease both', animationFillMode: 'both',
            }}>
              You know that thing where you want to hang out but nobody can agree on a time? Friendule fixes that. Add your friends, describe their schedules, and it figures out when everyone's actually free.
            </p>

            <div style={{
              display: 'flex', gap: 10, flexWrap: 'wrap',
              animation: 'flin .45s .21s ease both', animationFillMode: 'both',
            }}>
              <Button variant="primary" size="lg" onClick={openSignup}>Get started free</Button>
              <Button variant="secondary" size="lg" onClick={openLogin}>Log in</Button>
            </div>

            {/* Feature chips */}
            <div style={{
              display: 'flex', gap: 18, marginTop: 36, flexWrap: 'wrap', alignItems: 'center',
              animation: 'flin .45s .29s ease both', animationFillMode: 'both',
            }}>
              <Chip
                label="Month & week views"
                icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>}
              />
              <Chip
                label="Timezone-aware"
                icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
              />
              <Chip
                label="Private by default"
                icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              />
            </div>
          </div>

          {/* Right: calendar mockup */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            animation: 'flin .55s .15s ease both, lpFloat 6s 1s ease-in-out infinite',
            animationFillMode: 'both',
          }}>
            <MiniCalendar />
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" style={{
          maxWidth: 1160, margin: '0 auto',
          padding: 'clamp(40px,8vw,80px) clamp(16px,4vw,48px)',
        }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <SectionTag>What you get</SectionTag>
              <h2 style={{
                fontFamily: 'var(--font-sans)', fontWeight: 800,
                fontSize: 'clamp(1.5rem,3vw,2rem)', lineHeight: 1.15,
                letterSpacing: '-0.025em', color: 'var(--text-primary)',
                margin: '0 0 12px',
              }}>
                Made for real plans with real friends
              </h2>
              <p style={{
                fontSize: '0.9375rem', color: 'var(--text-secondary)',
                lineHeight: 1.6, maxWidth: 480, margin: '0 auto',
              }}>
                No enterprise nonsense. Just the stuff you actually need to stop playing calendar ping-pong.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.07}>
                <div
                  style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 16,
                    padding: '24px',
                    height: '100%',
                    cursor: 'default',
                    transition: 'border-color var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `var(--cat-${f.cat}-ink)`;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 11,
                    background: `var(--cat-${f.cat}-fill)`,
                    color: `var(--cat-${f.cat}-ink)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>{f.icon}</div>

                  {/* Title */}
                  <div style={{
                    fontFamily: 'var(--font-sans)', fontWeight: 700,
                    fontSize: '1rem', color: 'var(--text-primary)',
                    letterSpacing: '-0.015em', marginBottom: 8,
                  }}>{f.title}</div>

                  <div style={{
                    fontSize: '0.8rem', color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                  }}>{f.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── MY CALENDAR ── */}
        <section style={{
          maxWidth: 1160, margin: '0 auto',
          padding: 'clamp(40px,8vw,80px) clamp(16px,4vw,48px)',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(32px,5vw,72px)', alignItems: 'center',
          }} className="lp-two-col">

            {/* Left: mockup */}
            <FadeIn style={{ display: 'flex', justifyContent: 'center' }}>
              <PersonalScheduleMockup />
            </FadeIn>

            {/* Right: copy */}
            <FadeIn delay={0.1}>
              <SectionTag color="var(--cat-amber-ink)">My Calendar</SectionTag>
              <h2 style={{
                fontWeight: 800,
                fontSize: 'clamp(1.4rem,2.5vw,1.875rem)', lineHeight: 1.15,
                letterSpacing: '-0.025em', color: 'var(--text-primary)',
                margin: '0 0 16px',
              }}>
                You deserve easy scheduling too
              </h2>
              <p style={{
                fontSize: '0.9375rem', color: 'var(--text-secondary)',
                lineHeight: 1.65, marginBottom: 28,
              }}>
                Friendule isn't just about tracking your friends. You get your own personal calendar too — add your work hours, your gym days, your free afternoons. That way, when someone's looking for time with you, your availability is already in there.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  {
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>,
                    title: 'Your own space',
                    desc: 'A dedicated calendar just for you, separate from your friends\' views.',
                  },
                  {
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>,
                    title: 'Same natural input',
                    desc: 'Type or say "Work Mon–Fri 9–5" and it\'s blocked out instantly, just like with friends.',
                  },
                  {
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>,
                    title: 'Shows up in the group view',
                    desc: 'Your schedule is factored in when friends look for a good time to meet.',
                  },
                ].map(({ icon, title, desc }) => (
                  <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: 'var(--cat-amber-fill)',
                      border: '1px solid var(--cat-amber-ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--cat-amber-ink)',
                    }}>{icon}</span>
                    <div style={{ paddingTop: 2 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 3 }}>{title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── AI HIGHLIGHT ── */}
        <section style={{
          maxWidth: 1160, margin: '0 auto',
          padding: 'clamp(40px,8vw,80px) clamp(16px,4vw,48px)',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(32px,5vw,72px)', alignItems: 'center',
          }} className="lp-two-col">

            {/* Left: gradient card with terminal demo */}
            <FadeIn>
              <div style={{
                background: 'linear-gradient(140deg, var(--violet-500), var(--violet-800))',
                borderRadius: 20, padding: 'clamp(28px,4vw,40px)',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Decorative blobs */}
                <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative' }}>
                  {/* Icon */}
                  <div style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: 'rgba(255,255,255,.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                    </svg>
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,.6)', marginBottom: 8,
                  }}>Voice &amp; text input</div>
                  <div style={{
                    fontFamily: 'var(--font-sans)', fontWeight: 700,
                    fontSize: '1.25rem', lineHeight: 1.2, letterSpacing: '-0.02em',
                    color: '#fff', marginBottom: 12,
                  }}>Just say it out loud</div>
                  <div style={{
                    fontSize: '0.825rem', color: 'rgba(255,255,255,.75)',
                    lineHeight: 1.6, marginBottom: 22,
                  }}>
                    Tap the mic and speak naturally. Groq Whisper transcribes your voice in real time, then Claude AI parses your intent.
                  </div>
                  <ParserDemo />
                </div>
              </div>
            </FadeIn>

            {/* Right: copy */}
            <FadeIn delay={0.1}>
              <div>
                <SectionTag>AI-powered</SectionTag>
                <h2 style={{
                  fontFamily: 'var(--font-sans)', fontWeight: 800,
                  fontSize: 'clamp(1.4rem,2.5vw,1.875rem)', lineHeight: 1.15,
                  letterSpacing: '-0.025em', color: 'var(--text-primary)',
                  margin: '0 0 16px',
                }}>
                  Just say it how you'd say it
                </h2>
                <p style={{
                  fontSize: '0.9375rem', color: 'var(--text-secondary)',
                  lineHeight: 1.6, marginBottom: 28,
                }}>
                  No dropdowns, no forms, no fussing. Type something like <em>&ldquo;Busy weekdays 9–5&rdquo;</em> or speak it out loud — Friendule gets it and adds the rule. Done.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    {
                      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
                      text: 'Type naturally — "Free this weekend", "Remove gym"',
                    },
                    {
                      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>,
                      text: 'Speak instead — voice transcription via Groq Whisper',
                    },
                    {
                      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
                      text: 'Claude AI parses complex schedules and asks if anything\'s unclear',
                    },
                    {
                      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
                      text: 'Once, daily, or weekly rules — all from one sentence',
                    },
                  ].map(({ icon, text }) => (
                    <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 30, height: 30, borderRadius: 9,
                        background: 'var(--accent-wash)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, color: 'var(--text-brand)',
                      }}>{icon}</span>
                      <span style={{
                        fontSize: '0.8rem', color: 'var(--text-secondary)',
                        lineHeight: 1.55, paddingTop: 6,
                      }}>{text}</span>
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
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <SectionTag color="var(--cat-blue-ink)">How it works</SectionTag>
              <h2 style={{
                fontFamily: 'var(--font-sans)', fontWeight: 800,
                fontSize: 'clamp(1.5rem,3vw,2rem)', lineHeight: 1.15,
                letterSpacing: '-0.025em', color: 'var(--text-primary)',
                margin: 0,
              }}>
                Three steps and you're hanging out
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {STEPS.map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.1}>
                <div style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 16, padding: '28px 24px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Watermark number */}
                  <div style={{
                    position: 'absolute', top: -10, right: 16,
                    fontFamily: 'var(--font-mono)', fontSize: '5rem',
                    fontWeight: 700, color: 'var(--accent-wash)',
                    lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                    letterSpacing: '-0.04em',
                  }}>{s.n}</div>

                  {/* Step dot */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 600,
                      color: 'var(--text-tertiary)', letterSpacing: '0.08em',
                    }}>{s.n}</span>
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-sans)', fontWeight: 700,
                    fontSize: '1.0625rem', color: 'var(--text-primary)', marginBottom: 10,
                    letterSpacing: '-0.015em',
                  }}>{s.title}</div>
                  <div style={{
                    fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                  }}>{s.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{
          maxWidth: 1160, margin: '0 auto',
          padding: 'clamp(32px,6vw,60px) clamp(16px,4vw,48px) clamp(72px,10vw,112px)',
        }}>
          <FadeIn>
            <div style={{
              background: 'linear-gradient(140deg, var(--violet-500), var(--violet-800))',
              borderRadius: 24, padding: 'clamp(40px,6vw,64px)',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
            }}>
              {/* Decorative */}
              <div style={{ position: 'absolute', top: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
              {/* Dot grid overlay */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.2) 1px, transparent 1px)',
                backgroundSize: '24px 24px', opacity: 0.25, borderRadius: 24,
              }} />

              <div style={{ position: 'relative' }}>
                {/* Stacked avatars */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  {FRIENDS_DEMO.map((f, i) => (
                    <span key={f.name} style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: f.color, color: '#fff',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13,
                      boxShadow: '0 0 0 3px var(--violet-700)',
                      marginLeft: i === 0 ? 0 : -10,
                      position: 'relative', zIndex: i,
                    }}>{f.name[0]}</span>
                  ))}
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-sans)', fontWeight: 800,
                  fontSize: 'clamp(1.5rem,3vw,2rem)', lineHeight: 1.15,
                  letterSpacing: '-0.025em', color: '#fff',
                  margin: '0 0 14px',
                }}>
                  Your people are waiting.
                </h2>
                <p style={{
                  fontSize: '0.9375rem', color: 'rgba(255,255,255,.78)',
                  marginBottom: 32, maxWidth: 380, margin: '0 auto 32px',
                  lineHeight: 1.6,
                }}>
                  Free to use, no credit card needed. Stop missing each other — it takes about two minutes to get set up.
                </p>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    size="lg"
                    style={{ background: '#fff', color: 'var(--violet-600)', fontWeight: 700, boxShadow: 'var(--shadow-md)' }}
                    onClick={openSignup}
                  >Get started free</Button>
                  <Button
                    size="lg"
                    style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.25)' }}
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
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
          maxWidth: 1160, margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--cat-rose-ink)', display: 'inline-block' }} />
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--cat-amber-ink)', display: 'inline-block', marginLeft: -5 }} />
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', marginLeft: -5 }} />
            </div>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.825rem', color: 'var(--text-primary)' }}>Friendule</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
            color: 'var(--text-tertiary)', letterSpacing: '0.04em',
          }}>
            Know when your people are free.
          </div>
        </footer>
      </div>

      {/* Responsive overrides + animations */}
      <style>{`
        .lp-root { --font-sans: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .lp-root, .lp-root * { cursor: none !important; }
        @keyframes ptr-heartbeat {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.22); }
        }
        @keyframes ptr-rock {
          0%, 100% { transform: scale(0.88) rotate(0deg); }
          33%       { transform: scale(1)    rotate(5deg); }
          66%       { transform: scale(0.88) rotate(-5deg); }
        }
        .ptr-heart-wrap { animation: ptr-rock 1.5s ease-in-out infinite; }
        .ptr-heart-fill { animation: ptr-heartbeat 0.8s ease-in-out infinite; transform-origin: center; display: block; }
        @keyframes lpFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @media (max-width: 768px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; }
          .lp-two-col   { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
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
