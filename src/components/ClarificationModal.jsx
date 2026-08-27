import { useState } from 'react';
import { Button, Input } from './ds.jsx';

export default function ClarificationModal({ clarification, onConfirm, onCancel }) {
  const [answer, setAnswer] = useState('');

  if (!clarification) return null;

  const handleConfirm = () => {
    const trimmed = answer.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    setAnswer('');
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleConfirm(); }
    if (e.key === 'Escape') { onCancel(); setAnswer(''); }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(16,16,25,.55)',
        backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9000, padding: '20px',
        animation: 'ovin .2s ease both',
      }}
      onClick={e => { if (e.target === e.currentTarget) { onCancel(); setAnswer(''); } }}
    >
      <div
        style={{
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 28px 22px',
          maxWidth: '480px', width: '100%',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
          animation: 'pop .24s cubic-bezier(.2,.8,.3,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '18px' }}>
          <div style={{
            flexShrink: 0, width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--cat-amber-fill)',
            border: '1px solid var(--cat-amber-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cat-amber-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-title)', color: 'var(--text-primary)', marginBottom: '4px' }}>
              A little more info needed
            </div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {clarification.question}
            </div>
          </div>
        </div>

        {/* Answer input */}
        <Input
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer…"
          autoFocus
          wrapStyle={{ width: '100%' }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => { onCancel(); setAnswer(''); }}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!answer.trim()}>Submit</Button>
        </div>
      </div>
    </div>
  );
}
