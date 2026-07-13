/**
 * Friendule Design System — Component Library
 * All primitives in one barrel file.
 */
import React from 'react';

/* ─── BUTTON ─── */
export function Button({
  children, variant = 'primary', size = 'md',
  iconLeft = null, iconRight = null,
  disabled = false, full = false, style = {}, ...rest
}) {
  const sizes = {
    sm: { height: 34, padding: '0 14px', font: 'var(--fs-sm)',   radius: 'var(--radius-sm)', gap: 6 },
    md: { height: 42, padding: '0 18px', font: 'var(--fs-body)', radius: 'var(--radius-md)', gap: 8 },
    lg: { height: 50, padding: '0 24px', font: 'var(--fs-title)',radius: 'var(--radius-md)', gap: 10 },
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    primary:   { background: 'var(--accent)',       color: '#fff',                  border: '1px solid transparent',           boxShadow: 'var(--shadow-sm)' },
    ink:       { background: 'var(--ink-strong)',   color: 'var(--text-inverse)',   border: '1px solid transparent',           boxShadow: 'var(--shadow-sm)' },
    secondary: { background: 'var(--surface-card)', color: 'var(--text-primary)',   border: '1px solid var(--border-strong)',  boxShadow: 'var(--shadow-xs)' },
    soft:      { background: 'var(--accent-wash)',  color: 'var(--text-brand)',     border: '1px solid transparent',           boxShadow: 'none' },
    ghost:     { background: 'transparent',         color: 'var(--text-secondary)', border: '1px solid transparent',           boxShadow: 'none' },
    danger:    { background: 'var(--danger)',        color: '#fff',                  border: '1px solid transparent',           boxShadow: 'var(--shadow-sm)' },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: s.gap, height: s.height, padding: s.padding,
        width: full ? '100%' : 'auto',
        fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)',
        fontSize: s.font, letterSpacing: '-0.01em', lineHeight: 1,
        borderRadius: s.radius, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'transform var(--dur-fast) var(--ease-out), filter var(--dur-fast) var(--ease-out)',
        whiteSpace: 'nowrap', ...v, ...style,
      }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'none'; }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.05)'; }}
      {...rest}
    >
      {iconLeft}{children}{iconRight}
    </button>
  );
}

/* ─── ICON BUTTON ─── */
export function IconButton({
  children, variant = 'surface', size = 'md', shape = 'rounded',
  disabled = false, style = {}, ...rest
}) {
  const sizes = { sm: 30, md: 38, lg: 44 };
  const dim = sizes[size] || sizes.md;
  const variants = {
    surface: { background: 'var(--surface-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' },
    soft:    { background: 'var(--accent-wash)',  color: 'var(--text-brand)',     border: '1px solid transparent' },
    ghost:   { background: 'transparent',          color: 'var(--text-secondary)', border: '1px solid transparent' },
    ink:     { background: 'var(--ink-strong)',   color: 'var(--text-inverse)',   border: '1px solid transparent' },
  };
  const v = variants[variant] || variants.surface;
  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: dim, height: dim, padding: 0,
        borderRadius: shape === 'circle' ? '999px' : 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
        transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
        ...v, ...style,
      }}
      onMouseEnter={e => { if (!disabled && variant === 'surface') e.currentTarget.style.background = 'var(--surface-hover)'; }}
      onMouseLeave={e => { if (variant === 'surface') e.currentTarget.style.background = 'var(--surface-card)'; }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.92)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ─── AVATAR ─── */
const AVATAR_TONES = ['violet', 'blue', 'mint', 'amber', 'rose', 'sage'];

export function Avatar({ src = null, name = '', size = 36, tone, status = null, ring = false, style = {}, ...rest }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const picked = tone || AVATAR_TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length];
  const statusColor = status === 'online' ? 'var(--success)' : status === 'busy' ? 'var(--warning)' : null;
  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0, ...style }} {...rest}>
      <span style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: `var(--cat-${picked}-fill)`, color: `var(--cat-${picked}-ink)`,
        fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)',
        fontSize: Math.round(size * 0.4), letterSpacing: '-0.02em',
        boxShadow: ring ? '0 0 0 2px var(--surface-card), 0 0 0 4px var(--accent)' : 'none',
      }}>
        {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
      </span>
      {statusColor && (
        <span style={{
          position: 'absolute', right: 0, bottom: 0,
          width: size * 0.28, height: size * 0.28,
          borderRadius: '50%', background: statusColor,
          border: '2px solid var(--surface-card)',
        }} />
      )}
    </span>
  );
}

/* ─── AVATAR GROUP ─── */
export function AvatarGroup({ people = [], max = 4, size = 32, style = {}, ...rest }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  const overlap = Math.round(size * 0.32);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', ...style }} {...rest}>
      {shown.map((p, i) => (
        <span key={i} style={{ marginLeft: i === 0 ? 0 : -overlap, borderRadius: '50%', boxShadow: '0 0 0 2px var(--surface-card)', position: 'relative', zIndex: i }}>
          <Avatar {...p} size={size} />
        </span>
      ))}
      {extra > 0 && (
        <span style={{
          marginLeft: -overlap, width: size, height: size, borderRadius: '50%',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--surface-inset)', color: 'var(--text-secondary)',
          fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)',
          fontSize: Math.round(size * 0.34),
          boxShadow: '0 0 0 2px var(--surface-card)', zIndex: shown.length,
        }}>+{extra}</span>
      )}
    </span>
  );
}

/* ─── BADGE ─── */
export function Badge({ children, tone = 'neutral', variant = 'soft', dot = false, style = {}, ...rest }) {
  const map = {
    neutral: { fill: 'var(--surface-inset)',    ink: 'var(--text-secondary)', solid: 'var(--slate-700)' },
    brand:   { fill: 'var(--accent-wash)',       ink: 'var(--text-brand)',    solid: 'var(--accent)' },
    success: { fill: 'var(--cat-mint-fill)',     ink: 'var(--cat-mint-ink)',  solid: 'var(--success)' },
    warning: { fill: 'var(--cat-amber-fill)',    ink: 'var(--cat-amber-ink)', solid: 'var(--warning)' },
    danger:  { fill: 'var(--cat-rose-fill)',     ink: 'var(--cat-rose-ink)',  solid: 'var(--danger)' },
    info:    { fill: 'var(--cat-blue-fill)',     ink: 'var(--cat-blue-ink)',  solid: 'var(--info)' },
    together:{ fill: 'var(--cat-violet-fill)',   ink: 'var(--cat-violet-ink)',solid: 'var(--violet-500)' },
  };
  const t = map[tone] || map.neutral;
  const looks = {
    soft:    { background: t.fill, color: t.ink, border: '1px solid transparent' },
    solid:   { background: t.solid, color: '#fff', border: '1px solid transparent' },
    outline: { background: 'transparent', color: t.ink, border: `1px solid ${t.ink}` },
  };
  const l = looks[variant] || looks.soft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      height: 22, padding: '0 9px', borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-2xs)',
      fontWeight: 'var(--fw-semibold)', letterSpacing: '0.01em',
      whiteSpace: 'nowrap', ...l, ...style,
    }} {...rest}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />}
      {children}
    </span>
  );
}

/* ─── EVENT CHIP ─── */
export function EventChip({ title, time = null, category = 'violet', variant = 'filled', style = {}, ...rest }) {
  const fill = `var(--cat-${category}-fill)`;
  const ink  = `var(--cat-${category}-ink)`;
  const base = {
    display: 'flex', flexDirection: 'column', gap: 2,
    padding: '4px 8px', borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-sans)', cursor: 'pointer',
    transition: 'transform var(--dur-fast) var(--ease-out), filter var(--dur-fast) var(--ease-out)',
    overflow: 'hidden',
  };
  const look = variant === 'line'
    ? { background: 'var(--surface-card)', borderLeft: `3px solid ${ink}`, boxShadow: 'var(--shadow-xs)' }
    : { background: fill, borderLeft: `3px solid ${ink}` };
  return (
    <div
      style={{ ...base, ...look, ...style }}
      onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.98)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; }}
      {...rest}
    >
      <span style={{
        fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)',
        color: variant === 'line' ? 'var(--text-primary)' : ink,
        lineHeight: 1.25, letterSpacing: '-0.01em',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{title}</span>
      {time && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-2xs)', fontWeight: 500,
          color: variant === 'line' ? 'var(--text-tertiary)' : ink,
          opacity: variant === 'line' ? 1 : 0.85,
        }}>{time}</span>
      )}
    </div>
  );
}

/* ─── INPUT ─── */
export function Input({ icon = null, size = 'md', invalid = false, style = {}, wrapStyle = {}, ...rest }) {
  const heights = { sm: 36, md: 44, lg: 50 };
  const h = heights[size] || heights.md;
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      height: h, padding: '0 14px',
      background: 'var(--surface-card)',
      border: `1px solid ${invalid ? 'var(--danger)' : focus ? 'var(--border-brand)' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? `0 0 0 var(--ring-width) var(--focus-ring)` : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
      ...wrapStyle,
    }}>
      {icon && <span style={{ display: 'inline-flex', color: 'var(--text-tertiary)', flexShrink: 0 }}>{icon}</span>}
      <input
        onFocus={e => { setFocus(true); rest.onFocus && rest.onFocus(e); }}
        onBlur={e => { setFocus(false); rest.onBlur && rest.onBlur(e); }}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)',
          color: 'var(--text-primary)', minWidth: 0, ...style,
        }}
        {...rest}
      />
    </div>
  );
}

/* ─── TOGGLE ─── */
export function Toggle({ checked = false, onChange = () => {}, disabled = false, size = 'md', style = {}, ...rest }) {
  const dims = size === 'sm' ? { w: 36, h: 20, k: 14 } : { w: 46, h: 26, k: 20 };
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: dims.w, height: dims.h, padding: 3, border: 'none',
        borderRadius: 'var(--radius-pill)', cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked ? 'var(--accent)' : 'var(--border-strong)',
        opacity: disabled ? 0.5 : 1, position: 'relative',
        transition: 'background var(--dur-base) var(--ease-out)',
        display: 'inline-flex', alignItems: 'center', flexShrink: 0,
        ...style,
      }}
      {...rest}
    >
      <span style={{
        width: dims.k, height: dims.k, borderRadius: '50%', background: '#fff',
        boxShadow: 'var(--shadow-sm)',
        transform: checked ? `translateX(${dims.w - dims.k - 6}px)` : 'translateX(0)',
        transition: 'transform var(--dur-base) var(--ease-spring)',
      }} />
    </button>
  );
}

/* ─── CARD ─── */
export function Card({ children, variant = 'default', padding = 'lg', style = {}, ...rest }) {
  const pads = { sm: 'var(--space-4)', md: 'var(--space-5)', lg: 'var(--space-6)' };
  const looks = {
    default: { background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)',   color: 'var(--text-primary)' },
    sunken:  { background: 'var(--surface-sunken)',border: '1px solid var(--border-subtle)', boxShadow: 'none',              color: 'var(--text-primary)' },
    feature: { background: 'linear-gradient(135deg, var(--violet-400), var(--violet-600))', border: '1px solid transparent', boxShadow: 'var(--shadow-sm)', color: '#fff' },
  };
  const l = looks[variant] || looks.default;
  return (
    <div style={{ borderRadius: 'var(--radius-lg)', padding: pads[padding] || pads.lg, ...l, ...style }} {...rest}>
      {children}
    </div>
  );
}

/* ─── SEGMENTED CONTROL ─── */
export function SegmentedControl({ options = [], value, onChange = () => {}, size = 'md', style = {}, ...rest }) {
  const items = options.map(o => typeof o === 'string' ? { label: o, value: o } : o);
  const h = size === 'sm' ? 30 : 38;
  const pad = size === 'sm' ? '0 12px' : '0 16px';
  const fs = size === 'sm' ? 'var(--fs-sm)' : 'var(--fs-body)';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 3, padding: 3,
      background: 'var(--surface-inset)', borderRadius: 'var(--radius-md)',
      ...style,
    }} {...rest}>
      {items.map(it => {
        const on = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            style={{
              height: h, padding: pad, border: 'none', cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-sans)', fontSize: fs,
              fontWeight: 'var(--fw-semibold)', letterSpacing: '-0.01em',
              background: on ? 'var(--accent)' : 'transparent',
              color: on ? '#fff' : 'var(--text-secondary)',
              boxShadow: on ? 'var(--shadow-sm)' : 'none',
              transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
            }}
          >{it.label}</button>
        );
      })}
    </div>
  );
}

/* ─── NAV ITEM ─── */
export function NavItem({ icon = null, children, active = false, badge = null, theme = 'light', style = {}, ...rest }) {
  const dark = theme === 'dark';
  const activeBg  = dark ? 'var(--slate-800)' : 'var(--accent-wash)';
  const activeInk = dark ? '#fff' : 'var(--text-brand)';
  const idleInk   = dark ? 'var(--slate-400)' : 'var(--text-secondary)';
  return (
    <div
      role="button"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        height: 42, padding: '0 12px', borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)',
        fontWeight: active ? 'var(--fw-semibold)' : 'var(--fw-medium)',
        color: active ? activeInk : idleInk,
        background: active ? activeBg : 'transparent',
        cursor: 'pointer',
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
        ...style,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = dark ? 'var(--slate-800)' : 'var(--surface-hover)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      {...rest}
    >
      {icon && <span style={{ display: 'inline-flex', width: 20, height: 20, flexShrink: 0 }}>{icon}</span>}
      <span style={{ flex: 1 }}>{children}</span>
      {badge != null && (
        <span style={{
          minWidth: 20, height: 20, padding: '0 6px', borderRadius: 'var(--radius-pill)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--accent)', color: '#fff',
          fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)',
        }}>{badge}</span>
      )}
    </div>
  );
}

/* ─── DATE PILL ─── */
export function DatePill({ month = 'APR', day = 4, tone = 'brand', style = {}, ...rest }) {
  const tones = {
    brand: { top: 'var(--accent)',     body: 'var(--surface-card)', ink: 'var(--text-primary)' },
    ink:   { top: 'var(--ink-strong)', body: 'var(--surface-card)', ink: 'var(--text-primary)' },
    rose:  { top: 'var(--danger)',     body: 'var(--surface-card)', ink: 'var(--text-primary)' },
  };
  const t = tones[tone] || tones.brand;
  return (
    <div style={{
      width: 56, borderRadius: 'var(--radius-md)', overflow: 'hidden',
      border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)',
      fontFamily: 'var(--font-sans)', textAlign: 'center', flexShrink: 0,
      ...style,
    }} {...rest}>
      <div style={{ background: t.top, color: '#fff', fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)', letterSpacing: 'var(--ls-caps)', padding: '3px 0' }}>
        {String(month).toUpperCase()}
      </div>
      <div style={{ background: t.body, color: t.ink, fontSize: 'var(--fs-h3)', fontWeight: 'var(--fw-extra)', letterSpacing: '-0.02em', padding: '4px 0 6px' }}>
        {day}
      </div>
    </div>
  );
}
