export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const crypto = await import('crypto');
  const pastes = global.pastes || new Map();
  global.pastes = pastes;

  if (req.method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => body += chunk);
      
      const data = JSON.parse(body);
      const { content, language = 'plaintext', title = '' } = data;
      
      if (!content || content.length > 50000) {
        return res.status(400).json({ error: 'Content too large' });
      }

      const id = crypto.randomBytes(4).toString('hex');
      const paste = {
        id, content, language, title: title.slice(0,100),
        createdAt: new Date().toISOString(), views: 0
      };

      pastes.set(id, paste);
      res.status(200).json({ id, url: `/?id=${id}` });
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
    }
  } 
  else if (req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get('id');
    
    if (!id) return res.status(400).json({ error: 'Missing ID' });
    
    const paste = pastes.get(id);
    if (!paste) return res.status(404).json({ error: 'Not found' });
    
    paste.views++;
    pastes.set(id, paste);
    res.json(paste);
  } 
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
                          }
