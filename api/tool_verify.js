export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { license_key, hwid } = req.body || {};

  if (!license_key) {
    return res.status(400).json({ valid: false, message: 'يرجى إرسال مفتاح الترخيص' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ valid: false, message: 'متغيرات البيئة غير مهيأة في Vercel' });
  }

  try {
    // جلب بيانات الترخيص من Supabase مباشرة
    const response = await fetch(`${SUPABASE_URL}/rest/v1/licenses?license_key=eq.${encodeURIComponent(license_key)}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    const data = await response.json();
    const license = data[0];

    if (!license) {
      return res.status(400).json({ valid: false, message: 'مفتاح غير صحيح' });
    }

    if (license.status === 'banned') {
      return res.status(403).json({ valid: false, message: 'المفتاح محظور' });
    }

    // ربط الجهاز لأول مرة
    if (!license.hwid) {
      await fetch(`${SUPABASE_URL}/rest/v1/licenses?license_key=eq.${encodeURIComponent(license_key)}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ hwid: hwid, status: 'active' })
      });
      return res.status(200).json({ valid: true, message: 'تم تفعيل الجهاز بنجاح' });
    }

    // مطابقة بصمة الجهاز
    if (license.hwid === hwid) {
      return res.status(200).json({ valid: true, message: 'الترخيص صالح' });
    } else {
      return res.status(401).json({ valid: false, message: 'المفتاح مستخدم على جهاز آخر' });
    }

  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message });
  }
}
