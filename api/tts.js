export default async function handler(req, res) {
  const { text } = req.query;
  if (!text) { res.status(400).send('Missing text'); return; }
  try {
    const url = `https://dict.youdao.com/dictvoice?type=2&audio=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' }
    });
    if (!response.ok) throw new Error('Youdao error ' + response.status);
    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(buffer);
  } catch (e) {
    res.status(500).send('TTS unavailable');
  }
}
