import { useState, useRef } from 'react';

const EXAMPLES = [
  'Busy weekdays 9\u20135',
  'Gym Mon & Wed 7am',
  'Free this weekend',
  'Remove gym',
  'Clear Monday events',
  'Change work to 10\u20136',
];

function getMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

function EqualizerIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11 8h2v8h-2zm8 2h2v4h-2zm-4-5h2v14h-2zM7 3h2v18H7zM3 9h2v6H3z" />
    </svg>
  );
}

export default function PromptBox({ friend, prompt, setPrompt, commitPrompt, parsing, transcribe }) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [micError, setMicError] = useState(null);

  const recorderRef    = useRef(null);
  const chunksRef      = useRef([]);
  const recognitionRef = useRef(null);
  const liveBaseRef    = useRef('');

  const busy = parsing || transcribing;

  const handleSubmit = () => {
    if (!busy && !recording) commitPrompt();
  };

  const startRecording = async () => {
    setMicError(null);
    liveBaseRef.current = '';
    setPrompt('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = event => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) liveBaseRef.current += t + ' ';
          else interim = t;
        }
        setPrompt(liveBaseRef.current + interim);
      };
      recognition.onerror = () => {};
      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch { /* ignore */ }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        setTranscribing(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            try {
              const base64 = reader.result.split(',')[1];
              const data = await transcribe(base64, mimeType || 'audio/webm');
              if (data?.text) { setPrompt(data.text); }
            } catch (err) {
              setMicError('Transcription failed — ' + err.message);
            } finally {
              setTranscribing(false);
            }
          };
        } catch (err) {
          setMicError('Could not read audio — ' + err.message);
          setTranscribing(false);
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
        recognitionRef.current = null;
      }
      setMicError('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    setRecording(false);
  };

  const toggleRecording = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  const inputBorderColor = recording ? 'var(--danger)' : busy ? 'var(--border-strong)' : 'var(--border-brand)';

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 18px',
      marginTop: '14px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: 'var(--fs-sm)', color: busy ? 'var(--text-tertiary)' : 'var(--accent)', transition: 'color var(--dur-base)' }}>
          {busy
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin .8s linear infinite', display: 'block' }}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          }
        </span>
        <span style={{ fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-sm)', color: 'var(--text-primary)' }}>
          {friend.isSelf
            ? 'Add, update or remove your schedule'
            : 'Add, update or remove ' + friend.firstName + '\u2019s schedule'}
        </span>
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* Text input + voice button inside */}
        <div style={{
          flex: '1 1 280px', minWidth: 0,
          display: 'flex', alignItems: 'center', gap: '6px',
          height: '48px', padding: '0 6px 0 14px',
          background: 'var(--surface-card)',
          border: `1px solid ${inputBorderColor}`,
          borderRadius: 'var(--radius-md)',
          boxShadow: recording ? `0 0 0 var(--ring-width) color-mix(in srgb, var(--danger) 30%, transparent)` : `0 0 0 var(--ring-width) var(--focus-ring)`,
          transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
        }}>
          <input
            value={prompt}
            onChange={e => {
              if (recording) return;
              setPrompt(e.target.value);
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !recording) { e.preventDefault(); handleSubmit(); } }}
            placeholder={
              recording && !hasSpeechRecognition
                ? 'Listening\u2026 click the mic to stop'
                : 'e.g. Busy weekdays 9\u20135 \u2022 Remove gym \u2022 Change work hours to 10\u20136'
            }
            readOnly={recording}
            disabled={busy}
            style={{
              flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
              opacity: busy ? 0.6 : 1,
            }}
          />
          {/* Voice button */}
          <button
            onClick={toggleRecording}
            disabled={busy}
            title={recording ? 'Recording — click to stop' : 'Click to record'}
            style={{
              flexShrink: 0, width: '36px', height: '36px', padding: 0,
              border: 'none', borderRadius: 'var(--radius-sm)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: busy ? 'not-allowed' : 'pointer',
              background: recording ? 'var(--danger)' : 'var(--accent-wash)',
              color: recording ? '#fff' : 'var(--text-brand)',
              transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
            }}
            onMouseDown={e => { if (!busy) e.currentTarget.style.transform = 'scale(0.9)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {transcribing
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin .8s linear infinite' }}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              : recording
              ? <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', display: 'block', animation: 'pulse 1s ease-in-out infinite' }} />
              : <EqualizerIcon size={16} />
            }
          </button>
        </div>

        {/* Submit button */}
        <button
          disabled={busy || recording}
          onClick={handleSubmit}
          style={{
            flexShrink: 0, border: 'none', height: '48px',
            background: (busy || recording) ? 'var(--border-strong)' : 'var(--accent)',
            color: '#fff', borderRadius: 'var(--radius-md)', padding: '0 22px',
            fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body)',
            cursor: (busy || recording) ? 'not-allowed' : 'pointer',
            minWidth: '110px', boxShadow: (busy || recording) ? 'none' : 'var(--shadow-sm)',
            transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
          }}
          onMouseEnter={e => { if (!busy && !recording) e.currentTarget.style.filter = 'brightness(1.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseDown={e => { if (!busy && !recording) e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {parsing ? 'Thinking\u2026' : transcribing ? 'Transcribing\u2026' : 'Submit'}
        </button>
      </div>

      {/* Status banners */}
      {recording && (
        <div style={{
          marginTop: '10px', padding: '8px 14px',
          background: 'var(--cat-rose-fill)',
          border: '1px solid var(--cat-rose-ink)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--cat-rose-ink)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--danger)', display: 'inline-block', flexShrink: 0, animation: 'pulse 1s ease-in-out infinite' }} />
          {hasSpeechRecognition
            ? 'Live preview — transcript refines when you stop speaking'
            : 'Recording\u2026 click the mic button again to stop'}
        </div>
      )}

      {transcribing && (
        <div style={{
          marginTop: '10px', padding: '8px 14px',
          background: 'var(--cat-violet-fill)',
          border: '1px solid var(--cat-violet-ink)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--cat-violet-ink)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin .8s linear infinite', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Sending to Groq Whisper for final transcription\u2026
        </div>
      )}

      {micError && (
        <div style={{
          marginTop: '10px', padding: '8px 14px',
          background: 'var(--cat-rose-fill)',
          border: '1px solid var(--cat-rose-ink)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--cat-rose-ink)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>{micError}</span>
        </div>
      )}

      {!recording && !transcribing && !micError && (
        <div style={{ marginTop: '10px', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', minHeight: '16px' }}>
          {parsing ? 'Interpreting\u2026' : 'Describe, remove, or update a schedule and we\u2019ll handle it.'}
        </div>
      )}

      {/* Example chips */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            disabled={busy || recording}
            style={{
              border: '1px solid var(--border-strong)',
              background: 'var(--surface-sunken)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-medium)',
              cursor: (busy || recording) ? 'default' : 'pointer',
              opacity: (busy || recording) ? 0.5 : 1,
              fontFamily: 'var(--font-sans)',
              transition: 'background var(--dur-fast), border-color var(--dur-fast), color var(--dur-fast)',
            }}
            onMouseEnter={e => { if (!busy && !recording) { e.currentTarget.style.background = 'var(--accent-wash)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-brand)'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-sunken)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onClick={() => { setPrompt(ex); }}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
