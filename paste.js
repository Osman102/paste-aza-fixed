const crypto = require('crypto');

const pastes = new Map();

function generateId() {
  return crypto.randomBytes(4).toString('hex');
}

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { content, language = 'plaintext', title = '' } = req.body;
    
    if (!content || content.length > 50000) {
      return res.status(400).json({ error: 'Content too large' });
    }

    const id = generateId();
    const paste = {
      id, content, language, title: title.slice(0,100),
      createdAt: new Date().toISOString(), views: 0
    };

    pastes.set(id, paste);
    res.json({ id, url: `/?id=${id}` });
  } else if (req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get('id');
    
    if (!id) return res.status(400).json({ error: 'Missing ID' });
    
    const paste = pastes.get(id);
    if (!paste) return res.status(404).json({ error: 'Not found' });
    
    paste.views++;
    pastes.set(id, paste);
    res.json(paste);
  }
};
