export default async function handler(req, res) {
  const { text } = req.query;
  if (!text) { res.status(400).send('Missing text'); return; }

  // Try multiple sources in order — first one that returns valid audio wins
  const sources = [
    {
      name: 'google',
      url: `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=zh-CN&client=gtx&ttsspeed=0.8`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Referer': 'https://translate.google.com/',
        'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
      }
    },
    {
      name: 'youdao',
      url: `https://dict.youdao.com/dictvoice?type=2&audio=${encodeURIComponent(text)}`,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' }
    },
    {
      name: 'baidu',
      url: `https://fanyi.baidu.com/gettts?lan=zh&text=${encodeURIComponent(text)}&spd=3&source=web`,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' }
    },
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source.url, { headers: source.headers });
      if (!response.ok) continue;
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 200) continue; // skip empty or error responses
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-TTS-Source', source.name); // useful for debugging
      res.send(buffer);
      return;
    } catch (e) {
      continue; // try next source
    }
  }

  res.status(500).send('All TTS sources failed');
}
