const { Router } = require('express');
const Groq = require('groq-sdk');
const { toFile } = require('groq-sdk');

const router = Router();
let client = null;
function getClient() {
  if (!client) client = new Groq();
  return client;
}

router.post('/', async (req, res) => {
  const { audio, mimeType } = req.body || {};

  if (!audio || typeof audio !== 'string') {
    return res.status(400).json({ error: 'audio (base64) is required.' });
  }

  try {
    const buffer = Buffer.from(audio, 'base64');

    // Pick a file extension Whisper accepts based on the recorded MIME type
    let ext = 'webm';
    if (mimeType?.includes('mp4')) ext = 'mp4';
    else if (mimeType?.includes('ogg')) ext = 'ogg';

    const file = await toFile(buffer, `recording.${ext}`, {
      type: mimeType || 'audio/webm',
    });

    const result = await getClient().audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
    });

    res.json({ text: result.text });
  } catch (err) {
    console.error('Transcribe error:', err.message);
    res.status(500).json({ error: 'Transcription failed: ' + err.message });
  }
});

module.exports = router;
