export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 60, background: '#3A322C', color: '#fff', fontWeight: 700, fontSize: '14px', padding: '13px 20px', borderRadius: '14px', boxShadow: '0 12px 30px rgba(58,42,28,.32)', animation: 'toastin .26s ease both', display: 'flex', alignItems: 'center', gap: '9px' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: 'oklch(0.74 0.14 145)' }} />{message}
    </div>
  );
}
