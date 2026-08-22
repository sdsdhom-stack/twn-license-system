export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ 
      valid: false, 
      missing_url: !SUPABASE_URL,
      missing_key: !SUPABASE_KEY,
      message: 'متغيرات البيئة غير مهيأة في Vercel' 
    });
  }

  return res.status(200).json({ valid: true, message: 'المتغيرات متصلة بنجاح!' });
}
