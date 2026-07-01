const EXAMPLES = ['Busy weekdays 9\u20135', 'Gym Mon & Wed 7am', 'Free this weekend', 'Remove gym', 'Clear Monday events', 'Change work to 10\u20136'];

export default function PromptBox({ friend, prompt, setPrompt, commitPrompt, parsing, clarification, setClarification }) {
  const handleSubmit = () => {
    if (!parsing) commitPrompt();
  };

  return (
    <div style={{ background: 'linear-gradient(180deg,#FFF8F2,#FFFDFB)', border: '1px solid #F1E2D4', borderRadius: '22px', padding: '16px 18px', marginTop: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '15px' }}>{parsing ? '\u231B' : '\u2726'}</span>
        <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '.2px', whiteSpace: 'nowrap' }}>
          Add, update or remove {friend.firstName}&apos;s schedule
        </span>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'stretch' }}>
        <input
          value={prompt}
          onChange={e => { setPrompt(e.target.value); if (clarification) setClarification(null); }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } }}
          placeholder="e.g. Busy weekdays 9\u20135 \u2022 Remove gym \u2022 Change work hours to 10\u20136"
          disabled={parsing}
          style={{
            flex: '1 1 320px', minWidth: 0, border: '1px solid #ECD9C8', background: parsing ? '#F9F3EC' : '#fff',
            borderRadius: '14px', padding: '13px 15px', fontSize: '15px', fontWeight: 600, color: '#3A322C', outline: 'none',
            opacity: parsing ? 0.7 : 1,
          }}
        />
        <button
          disabled={parsing}
          style={{
            flex: '0 0 auto', border: 'none', background: parsing ? '#C19478' : '#E07A53', color: '#fff',
            borderRadius: '14px', padding: '0 22px', fontWeight: 800, fontSize: '15px',
            cursor: parsing ? 'wait' : 'pointer', minWidth: '150px',
          }}
          onClick={handleSubmit}
        >
          {parsing ? 'Thinking\u2026' : 'Submit'}
        </button>
      </div>

      {/* Clarification banner */}
      {clarification && (
        <div style={{
          marginTop: '11px', padding: '10px 14px', background: '#FFF4E0', border: '1px solid #F0D9A0',
          borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: '#7A5F2E',
          display: 'flex', alignItems: 'flex-start', gap: '8px',
        }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>?</span>
          <span>{clarification}</span>
        </div>
      )}

      {!clarification && (
        <div style={{
          marginTop: '11px', fontSize: '13px', fontWeight: 700,
          color: '#B6A99C', minHeight: '18px',
        }}>
          {parsing
            ? 'Interpreting...\u2026'
            : 'Describe, remove, or update a schedule and we will handle it.'}
        </div>
      )}

      <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginTop: '11px' }}>
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            disabled={parsing}
            style={{
              border: '1px dashed #E3CFBC', background: '#fff', color: '#9A6B4B',
              borderRadius: '999px', padding: '6px 12px', fontSize: '12.5px', fontWeight: 700,
              cursor: parsing ? 'default' : 'pointer', opacity: parsing ? 0.5 : 1,
            }}
            onClick={() => { setPrompt(ex); if (clarification) setClarification(null); }}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
