import { Button, Input, Toggle, SegmentedControl } from './ds.jsx';

function Label({ children, style = {} }) {
  return (
    <label style={{
      display: 'block',
      fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)',
      color: 'var(--text-tertiary)', textTransform: 'uppercase',
      letterSpacing: 'var(--ls-caps)',
      ...style,
    }}>
      {children}
    </label>
  );
}

export default function EventEditor({ editor, patchEd, toggleWd, closeEditor, saveEvent, deleteEvent }) {
  if (!editor) return null;

  const wdLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(16,16,25,.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '18px', zIndex: 50,
        animation: 'ovin .2s ease both',
      }}
      onClick={closeEditor}
    >
      <div
        style={{
          width: '440px', maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto',
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '22px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
          animation: 'pop .24s cubic-bezier(.2,.8,.3,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-title)', color: 'var(--text-primary)' }}>
            {editor.mode === 'edit' ? 'Edit event' : 'New event'}
          </div>
          <button
            style={{
              width: '34px', height: '34px', borderRadius: 'var(--radius-pill)',
              border: 'none', background: 'var(--surface-inset)',
              color: 'var(--text-secondary)', fontSize: '18px', cursor: 'pointer',
            }}
            onClick={closeEditor}
          >&#10005;</button>
        </div>

        {/* Title */}
        <Label>What&apos;s happening</Label>
        <Input
          value={editor.title}
          onChange={e => patchEd({ title: e.target.value })}
          placeholder="e.g. Yoga, Work, Free time"
          wrapStyle={{ marginTop: '6px', width: '100%' }}
        />

        {/* Status + Recurrence */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
          <div>
            <Label>Status</Label>
            <SegmentedControl
              options={['busy', 'free', 'together']}
              value={editor.status}
              onChange={v => patchEd({ status: v })}
              size="sm"
              style={{ marginTop: '6px', width: '100%' }}
            />
          </div>
          <div>
            <Label>When</Label>
            <SegmentedControl
              options={['once', 'weekly', 'daily']}
              value={editor.repeat}
              onChange={v => patchEd({ repeat: v })}
              size="sm"
              style={{ marginTop: '6px', width: '100%' }}
            />
          </div>
        </div>

        {/* Date (once) */}
        {editor.repeat === 'once' && (
          <div style={{ marginTop: '14px' }}>
            <Label>Date</Label>
            <div style={{
              marginTop: '6px',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}>
              <input
                type="date"
                value={editor.date}
                onChange={e => patchEd({ date: e.target.value })}
                style={{
                  width: '100%', border: 'none', outline: 'none', padding: '11px 14px',
                  fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)',
                  fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)', background: 'transparent',
                }}
              />
            </div>
          </div>
        )}

        {/* Weekdays (weekly) */}
        {editor.repeat === 'weekly' && (
          <div style={{ marginTop: '14px' }}>
            <Label>Repeats on</Label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {wdLabels.map((l, i) => {
                const on = editor.weekdays.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleWd(i)}
                    style={{
                      width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${on ? 'var(--accent)' : 'var(--border-strong)'}`,
                      background: on ? 'var(--accent)' : 'var(--surface-card)',
                      color: on ? '#fff' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-xs)',
                      cursor: 'pointer',
                      transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast), border-color var(--dur-fast)',
                    }}
                  >{l}</button>
                );
              })}
            </div>
          </div>
        )}

        {/* Date bounds for recurring rules */}
        {(editor.repeat === 'weekly' || editor.repeat === 'daily') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
            <div>
              <Label>Active from <span style={{ fontWeight: 'var(--fw-medium)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></Label>
              <div style={{ marginTop: '6px', background: 'var(--surface-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <input
                  type="date"
                  value={editor.dateFrom || ''}
                  onChange={e => patchEd({ dateFrom: e.target.value || '' })}
                  style={{ width: '100%', border: 'none', outline: 'none', padding: '11px 14px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-primary)', background: 'transparent' }}
                />
              </div>
            </div>
            <div>
              <Label>Until <span style={{ fontWeight: 'var(--fw-medium)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></Label>
              <div style={{ marginTop: '6px', background: 'var(--surface-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <input
                  type="date"
                  value={editor.dateTo || ''}
                  onChange={e => patchEd({ dateTo: e.target.value || '' })}
                  style={{ width: '100%', border: 'none', outline: 'none', padding: '11px 14px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-primary)', background: 'transparent' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* All-day toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
          <Toggle checked={editor.allDay} onChange={v => patchEd({ allDay: v })} size="sm" />
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-medium)', fontSize: 'var(--fs-body)', color: 'var(--text-primary)' }}>
            All-day
          </span>
        </div>

        {/* Time inputs */}
        {!editor.allDay && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
            <div>
              <Label>Start</Label>
              <div style={{ marginTop: '6px', background: 'var(--surface-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <input
                  type="time"
                  value={editor.start}
                  onChange={e => patchEd({ start: e.target.value })}
                  style={{ width: '100%', border: 'none', outline: 'none', padding: '11px 14px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-primary)', background: 'transparent' }}
                />
              </div>
            </div>
            <div>
              <Label>End</Label>
              <div style={{ marginTop: '6px', background: 'var(--surface-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <input
                  type="time"
                  value={editor.end}
                  onChange={e => patchEd({ end: e.target.value })}
                  style={{ width: '100%', border: 'none', outline: 'none', padding: '11px 14px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-primary)', background: 'transparent' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '22px' }}>
          {editor.mode === 'edit' && (
            <Button variant="danger" onClick={deleteEvent}>Delete</Button>
          )}
          <div style={{ flex: 1 }} />
          <Button variant="secondary" onClick={closeEditor}>Cancel</Button>
          <Button variant="primary" onClick={saveEvent}>Save</Button>
        </div>
      </div>
    </div>
  );
}
