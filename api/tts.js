export default async function handler(req, res) {
  const { text, lang = 'zh-CN' } = req.query;
  if (!text) { res.status(400).send('Missing text'); return; }

  const googleUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=gtx&ttsspeed=0.8`;
  const googleHeaders = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Referer': 'https://translate.google.com/',
    'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
  };

  // For non-Chinese languages, only Google works
  const sources = lang === 'zh-CN' ? [
    { name: 'google', url: googleUrl, headers: googleHeaders },
    { name: 'youdao', url: `https://dict.youdao.com/dictvoice?type=2&audio=${encodeURIComponent(text)}`, headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' } },
    { name: 'baidu', url: `https://fanyi.baidu.com/gettts?lan=zh&text=${encodeURIComponent(text)}&spd=3&source=web`, headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' } },
  ] : [
    { name: 'google', url: googleUrl, headers: googleHeaders },
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source.url, { headers: source.headers });
      if (!response.ok) continue;
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 100) continue;
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'private, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-TTS-Source', source.name);
      res.send(buffer);
      return;
    } catch (e) {
      continue;
    }
  }

  res.status(500).send('All TTS sources failed');
}
