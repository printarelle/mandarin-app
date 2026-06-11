export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).end(); return; }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'OPENAI_API_KEY not set in Vercel environment variables. Add it at vercel.com → your project → Settings → Environment Variables.' });
    return;
  }

  try {
    const { audio, mimeType = 'audio/webm' } = req.body || {};
    if (!audio) { res.status(400).json({ error: 'No audio received' }); return; }

    const audioBuffer = Buffer.from(audio, 'base64');

    // Build multipart form manually — more reliable than FormData in Node.js
    const boundary = 'WhisperBoundary' + Date.now();
    const CRLF = '\r\n';
    const parts = [
      `--${boundary}${CRLF}Content-Disposition: form-data; name="model"${CRLF}${CRLF}whisper-1`,
      `--${boundary}${CRLF}Content-Disposition: form-data; name="file"; filename="audio.webm"${CRLF}Content-Type: ${mimeType}${CRLF}${CRLF}`,
    ];
    const body = Buffer.concat([
      Buffer.from(parts[0] + CRLF),
      Buffer.from(parts[1]),
      audioBuffer,
      Buffer.from(`${CRLF}--${boundary}--${CRLF}`),
    ]);

    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });

    const data = await r.json();

    if (!r.ok) {
      const msg = data?.error?.message || data?.error || JSON.stringify(data);
      res.status(500).json({ error: String(msg) });
      return;
    }

    res.json({ text: data.text || '' });
  } catch (e) {
    res.status(500).json({ error: e?.message || String(e) });
  }
}
