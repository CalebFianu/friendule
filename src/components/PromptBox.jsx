import { useState, useRef } from 'react';

const EXAMPLES = ['Busy weekdays 9\u20135', 'Gym Mon & Wed 7am', 'Free this weekend', 'Remove gym', 'Clear Monday events', 'Change work to 10\u20136'];

function getMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

export default function PromptBox({ friend, prompt, setPrompt, commitPrompt, parsing, clarification, setClarification, transcribe }) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [micError, setMicError] = useState(null);

  const recorderRef    = useRef(null);
  const chunksRef      = useRef([]);
  const recognitionRef = useRef(null);
  // Accumulates the Web Speech API "final" segments so interim additions are correct
  const liveBaseRef    = useRef('');

  const busy = parsing || transcribing;

  const handleSubmit = () => {
    if (!busy && !recording) commitPrompt();
  };

  const startRecording = async () => {
    setMicError(null);
    liveBaseRef.current = '';
    setPrompt('');

    // ── Web Speech API — live interim display ──────────────────────────────
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous     = true;
      recognition.interimResults = true;
      recognition.lang           = 'en-US';

      recognition.onresult = event => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            liveBaseRef.current += t + ' ';
          } else {
            interim = t;
          }
        }
        setPrompt(liveBaseRef.current + interim);
        if (clarification) setClarification(null);
      };

      recognition.onerror = () => {}; // non-fatal — Groq will be the source of truth

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch { /* browser may deny a second start */ }
    }

    // ── MediaRecorder — audio for Groq ────────────────────────────────────
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
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
              const data   = await transcribe(base64, mimeType || 'audio/webm');
              if (data?.text) {
                // Groq's result replaces the live interim text
                setPrompt(data.text);
                if (clarification) setClarification(null);
              }
            } catch (err) {
              setMicError('Transcription failed — ' + err.message);
              // Keep whatever the live transcript captured as a fallback
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
      // Stop recognition if mic access was denied
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

  // Mic button styling
  let micBg    = '#F5ECE4';
  let micColor = '#9A6B4B';
  let micTitle = 'Click to record';
  if (recording)     { micBg = '#C04040'; micColor = '#fff'; micTitle = 'Recording — click to stop'; }
  if (transcribing)  { micBg = '#E0D4C8'; micColor = '#7A6E64'; micTitle = 'Transcribing\u2026'; }

  return (
    <div style={{ background: 'linear-gradient(180deg,#FFF8F2,#FFFDFB)', border: '1px solid #F1E2D4', borderRadius: '22px', padding: '16px 18px', marginTop: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '15px' }}>{busy ? '\u231B' : '\u2726'}</span>
        <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '.2px', whiteSpace: 'nowrap' }}>
          Add, update or remove {friend.firstName}&apos;s schedule
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* Text input — read-only while recording so live text renders without caret confusion */}
        <input
          value={prompt}
          onChange={e => {
            if (recording) return;
            setPrompt(e.target.value);
            if (clarification) setClarification(null);
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
            flex: '1 1 280px', minWidth: 0,
            border: `1px solid ${recording ? '#F5C4C4' : '#ECD9C8'}`,
            background: busy ? '#F9F3EC' : recording ? '#FFF8F8' : '#fff',
            borderRadius: '14px', padding: '13px 15px',
            fontSize: '15px', fontWeight: 600, color: '#3A322C',
            outline: 'none',
            opacity: busy ? 0.7 : 1,
            transition: 'border-color .2s, background .2s',
          }}
        />

        {/* Mic button */}
        <button
          onClick={toggleRecording}
          disabled={busy}
          title={micTitle}
          style={{
            flex: '0 0 auto', border: 'none', borderRadius: '14px',
            width: '48px', cursor: busy ? 'not-allowed' : 'pointer',
            background: micBg, color: micColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', transition: 'background .2s, color .2s',
          }}
        >
          {transcribing
            ? <span style={{ fontSize: '13px', fontWeight: 800, animation: 'fldots 1.2s steps(3,end) infinite' }}>&#9696;</span>
            : recording
            ? <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff', display: 'block', animation: 'pulse 1s ease-in-out infinite' }} />
            : <span>&#127908;</span>
          }
        </button>

        {/* Submit */}
        <button
          disabled={busy || recording}
          onClick={handleSubmit}
          style={{
            flex: '0 0 auto', border: 'none',
            background: (busy || recording) ? '#C19478' : '#E07A53',
            color: '#fff', borderRadius: '14px', padding: '0 22px',
            fontWeight: 800, fontSize: '15px',
            cursor: (busy || recording) ? 'not-allowed' : 'pointer',
            minWidth: '120px',
          }}
        >
          {parsing ? 'Thinking\u2026' : transcribing ? 'Transcribing\u2026' : 'Submit'}
        </button>
      </div>

      {/* Recording status bar */}
      {recording && (
        <div style={{
          marginTop: '11px', padding: '9px 14px',
          background: '#FEF0F0', border: '1px solid #F5C4C4',
          borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: '#8B2020',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%', background: '#C04040',
            display: 'inline-block', flexShrink: 0,
            animation: 'pulse 1s ease-in-out infinite',
          }} />
          {hasSpeechRecognition
            ? 'Live preview — We will refine the transcript when you stop speaking'
            : 'Recording\u2026 click the mic button again to stop'}
        </div>
      )}

      {/* Transcribing status bar */}
      {transcribing && (
        <div style={{
          marginTop: '11px', padding: '9px 14px',
          background: '#F4F0FF', border: '1px solid #D8CCFF',
          borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: '#5040A0',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '14px', animation: 'spin .8s linear infinite', display: 'inline-block' }}>&#9696;</span>
          Sending to Groq Whisper for final transcription\u2026
        </div>
      )}

      {/* Clarification banner */}
      {!recording && !transcribing && clarification && (
        <div style={{
          marginTop: '11px', padding: '10px 14px', background: '#FFF4E0', border: '1px solid #F0D9A0',
          borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: '#7A5F2E',
          display: 'flex', alignItems: 'flex-start', gap: '8px',
        }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>?</span>
          <span>{clarification}</span>
        </div>
      )}

      {/* Mic error */}
      {micError && (
        <div style={{
          marginTop: '11px', padding: '9px 14px', background: '#FEF0F0', border: '1px solid #F5C4C4',
          borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: '#8B2020',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span>&#9888;</span>
          <span>{micError}</span>
        </div>
      )}

      {/* Hint */}
      {!recording && !transcribing && !clarification && !micError && (
        <div style={{ marginTop: '11px', fontSize: '13px', fontWeight: 700, color: '#B6A99C', minHeight: '18px' }}>
          {parsing
            ? 'Interpreting\u2026'
            : 'Describe, remove, or update a schedule and we will handle it.'}
        </div>
      )}

      {/* Example chips */}
      <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginTop: '11px' }}>
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            disabled={busy || recording}
            style={{
              border: '1px dashed #E3CFBC', background: '#fff', color: '#9A6B4B',
              borderRadius: '999px', padding: '6px 12px', fontSize: '12.5px', fontWeight: 700,
              cursor: (busy || recording) ? 'default' : 'pointer',
              opacity: (busy || recording) ? 0.5 : 1,
            }}
            onClick={() => { setPrompt(ex); if (clarification) setClarification(null); }}
          >
            {ex}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(0.8); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
