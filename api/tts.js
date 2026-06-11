export default async function handler(req, res) {
  const { text, lang = 'zh-CN' } = req.query;
  if (!text) { res.status(400).send('Missing text'); return; }

  const googleUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=gtx&ttsspeed=0.8`;
  const googleHeaders = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    'Referer': 'https://translate.google.com/',
    'Accept': 'audio/mpeg,audio/*;q=0.9',
  };

  // For Chinese: race ALL sources simultaneously — fastest valid response wins.
  // In Ireland, Google typically wins. In China, Youdao/Baidu win.
  // For other languages (English): Google only.
  const sources = lang === 'zh-CN' ? [
    { name: 'youdao', url: `https://dict.youdao.com/dictvoice?type=2&audio=${encodeURIComponent(text)}`, headers: { 'User-Agent': 'Mozilla/5.0' } },
    { name: 'baidu', url: `https://fanyi.baidu.com/gettts?lan=zh&text=${encodeURIComponent(text)}&spd=3&source=web`, headers: { 'User-Agent': 'Mozilla/5.0' } },
    { name: 'google', url: googleUrl, headers: googleHeaders },
  ] : [
    { name: 'google', url: googleUrl, headers: googleHeaders },
  ];

  try {
    const result = await Promise.any(
      sources.map(async source => {
        const response = await fetch(source.url, { headers: source.headers });
        if (!response.ok) throw new Error(`${source.name} ${response.status}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length < 100) throw new Error(`${source.name} empty`);
        return { buffer, name: source.name };
      })
    );
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-TTS-Source', result.name);
    res.send(result.buffer);
  } catch (e) {
    res.status(500).send('All TTS sources failed');
  }
}
