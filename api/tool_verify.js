import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { license_key, hwid } = req.body;

  const { data: license, error } = await supabase
    .from('licenses')
    .select('*')
    .eq('license_key', license_key)
    .single();

  if (error || !license) return res.status(400).json({ valid: false, message: 'مفتاح غير صحيح' });
  if (license.status === 'banned') return res.status(403).json({ valid: false, message: 'المفتاح محظور' });

  // ربط المفتاح بـ HWID الخاص بأول جهاز يسجل الدخول
  if (!license.hwid) {
    await supabase.from('licenses').update({ hwid: hwid, status: 'active' }).eq('license_key', license_key);
    return res.status(200).json({ valid: true, message: 'تم تفعيل الجهاز بنجاح' });
  }

  // مطابقة الجهاز المسجل
  if (license.hwid === hwid) {
    return res.status(200).json({ valid: true, message: 'الترخيص صالح' });
  } else {
    return res.status(401).json({ valid: false, message: 'المفتاح مستخدم على جهاز آخر' });
  }
}
