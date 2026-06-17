export default function EventEditor({ editor, patchEd, toggleWd, closeEditor, saveEvent, deleteEvent }) {
  if (!editor) return null;

  const pillOn = { flex: 1, border: 'none', borderRadius: '9px', padding: '9px 0', fontWeight: 800, fontSize: '13px', cursor: 'pointer', background: '#fff', color: '#3A322C', boxShadow: '0 1px 3px rgba(80,55,30,.16)', textAlign: 'center' };
  const pillOff = { flex: 1, border: 'none', borderRadius: '9px', padding: '9px 0', fontWeight: 800, fontSize: '13px', cursor: 'pointer', background: 'transparent', color: '#8C7E70', textAlign: 'center' };
  const wdLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(58,42,28,.34)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px', zIndex: 50, animation: 'ovin .2s ease both' }} onClick={closeEditor}>
      <div style={{ width: '440px', maxWidth: '100%', maxHeight: '92vh', overflow: 'auto', background: '#fff', borderRadius: '24px', padding: '22px', boxShadow: '0 24px 60px rgba(58,42,28,.28)', animation: 'pop .24s cubic-bezier(.2,.8,.3,1) both' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: '19px' }}>{editor.mode === 'edit' ? 'Edit event' : 'New event'}</div>
          <button style={{ width: '34px', height: '34px', borderRadius: '999px', border: 'none', background: '#F3ECE2', color: '#6B5E52', fontSize: '18px', cursor: 'pointer', fontWeight: 700 }} onClick={closeEditor}>✕</button>
        </div>

        <label style={{ fontSize: '12px', fontWeight: 800, color: '#9A8E83', textTransform: 'uppercase', letterSpacing: '.5px' }}>What&apos;s happening</label>
        <input value={editor.title} onChange={e => patchEd({ title: e.target.value })} placeholder="e.g. Yoga, Work, Free time" style={{ width: '100%', marginTop: '6px', border: '1px solid #ECE2D6', borderRadius: '13px', padding: '12px 14px', fontSize: '15px', fontWeight: 600, outline: 'none' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 800, color: '#9A8E83', textTransform: 'uppercase', letterSpacing: '.5px' }}>Status</label>
            <div style={{ display: 'flex', background: '#F6EFE6', borderRadius: '12px', padding: '4px', marginTop: '6px' }}>
              <button style={editor.status === 'busy' ? pillOn : pillOff} onClick={() => patchEd({ status: 'busy' })}>Busy</button>
              <button style={editor.status === 'free' ? pillOn : pillOff} onClick={() => patchEd({ status: 'free' })}>Free</button>
              <button style={editor.status === 'together' ? pillOn : pillOff} onClick={() => patchEd({ status: 'together' })}>Together</button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 800, color: '#9A8E83', textTransform: 'uppercase', letterSpacing: '.5px' }}>When</label>
            <div style={{ display: 'flex', background: '#F6EFE6', borderRadius: '12px', padding: '4px', marginTop: '6px' }}>
              <button style={editor.repeat === 'once' ? pillOn : pillOff} onClick={() => patchEd({ repeat: 'once' })}>Once</button>
              <button style={editor.repeat === 'weekly' ? pillOn : pillOff} onClick={() => patchEd({ repeat: 'weekly' })}>Weekly</button>
              <button style={editor.repeat === 'daily' ? pillOn : pillOff} onClick={() => patchEd({ repeat: 'daily' })}>Daily</button>
            </div>
          </div>
        </div>

        {editor.repeat === 'once' && (
          <div style={{ marginTop: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 800, color: '#9A8E83', textTransform: 'uppercase', letterSpacing: '.5px' }}>Date</label>
            <input type="date" value={editor.date} onChange={e => patchEd({ date: e.target.value })} style={{ width: '100%', marginTop: '6px', border: '1px solid #ECE2D6', borderRadius: '13px', padding: '11px 14px', fontSize: '15px', fontWeight: 600, outline: 'none', color: '#3A322C' }} />
          </div>
        )}

        {editor.repeat === 'weekly' && (
          <div style={{ marginTop: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 800, color: '#9A8E83', textTransform: 'uppercase', letterSpacing: '.5px' }}>Repeats on</label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {wdLabels.map((l, i) => (
                <button key={i} onClick={() => toggleWd(i)} style={{
                  width: '38px', height: '38px', borderRadius: '11px',
                  border: '1.5px solid ' + (editor.weekdays.includes(i) ? '#E07A53' : '#ECE2D6'),
                  background: editor.weekdays.includes(i) ? '#E07A53' : '#fff',
                  color: editor.weekdays.includes(i) ? '#fff' : '#8C7E70',
                  fontWeight: 800, fontSize: '13px', cursor: 'pointer'
                }}>{l}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
          <button style={{
            width: '46px', height: '26px', borderRadius: '999px', border: 'none', cursor: 'pointer', padding: '3px',
            display: 'flex', justifyContent: editor.allDay ? 'flex-end' : 'flex-start',
            background: editor.allDay ? '#E07A53' : '#E2D7CA', transition: 'all .15s'
          }} onClick={() => patchEd({ allDay: !editor.allDay })}>
            <span style={{ width: '20px', height: '20px', borderRadius: '999px', background: '#fff', display: 'block', boxShadow: '0 1px 2px rgba(0,0,0,.2)' }} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '14px' }}>All-day</span>
        </div>

        {!editor.allDay && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#9A8E83', textTransform: 'uppercase', letterSpacing: '.5px' }}>Start</label>
              <input type="time" value={editor.start} onChange={e => patchEd({ start: e.target.value })} style={{ width: '100%', marginTop: '6px', border: '1px solid #ECE2D6', borderRadius: '13px', padding: '11px 14px', fontSize: '15px', fontWeight: 600, outline: 'none', color: '#3A322C' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#9A8E83', textTransform: 'uppercase', letterSpacing: '.5px' }}>End</label>
              <input type="time" value={editor.end} onChange={e => patchEd({ end: e.target.value })} style={{ width: '100%', marginTop: '6px', border: '1px solid #ECE2D6', borderRadius: '13px', padding: '11px 14px', fontSize: '15px', fontWeight: 600, outline: 'none', color: '#3A322C' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '22px' }}>
          {editor.mode === 'edit' && (
            <button style={{ border: '1px solid #EBD3CB', background: '#fff', color: '#C0563E', borderRadius: '13px', padding: '12px 16px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }} onClick={deleteEvent}>Delete</button>
          )}
          <div style={{ flex: 1 }} />
          <button style={{ border: '1px solid #ECE2D6', background: '#fff', color: '#6B5E52', borderRadius: '13px', padding: '12px 18px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }} onClick={closeEditor}>Cancel</button>
          <button style={{ border: 'none', background: '#E07A53', color: '#fff', borderRadius: '13px', padding: '12px 22px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }} onClick={saveEvent}>Save</button>
        </div>
      </div>
    </div>
  );
}
