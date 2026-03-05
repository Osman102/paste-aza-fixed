import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const crypto = await import('crypto');

  // SAVING A NEW PASTE
  if (req.method === 'POST') {
    const { content, language, title } = req.body;
    const id = crypto.randomBytes(4).toString('hex');

    const { data, error } = await supabase
      .from('pastes')
      .insert([{ id, content, language, title }])
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ id, url: `/?id=${id}` });
  }

  // RETRIEVING A PASTE
  if (req.method === 'GET') {
    const { id } = req.query;
    
    // Fetch and increment views simultaneously
    const { data, error } = await supabase
      .from('pastes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Pasta not found!' });

    // Update view count in the background
    await supabase.rpc('increment_views', { row_id: id });

    return res.status(200).json(data);
  }

  return res.status(405).end();
}
