export default async function handler(req, res) {
  // ضع رابط ورقم Supabase مباشرة هنا لتجاوز مشاكل Vercel نهائياً
  const SUPABASE_URL = "ضع_رابط_ملايين_سوبابيز_هنا"; // مثل https://enaowarssucihxtsjvur.supabase.co
  const SUPABASE_KEY = "ضع_مفتاح_publishable_هنا"; // المفتاح الذي تبدأ به sb_publishable_

  const license_key = req.body?.license_key || req.query?.license_key;
  const hwid = req.body?.hwid || req.query?.hwid;

  if (!license_key) {
    return res.status(400).json({ valid: false, message: 'يرجى إرسال مفتاح الترخيص (license_key)' });
  }

  try {
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

    // تفعيل الجهاز لأول مرة
    if (!license.hwid) {
      await fetch(`${SUPABASE_URL}/rest/v1/licenses?license_key=eq.${encodeURIComponent(license_key)}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ hwid: hwid || 'DEFAULT_HWID', status: 'active' })
      });
      return res.status(200).json({ valid: true, message: 'تم تفعيل الجهاز بنجاح' });
    }

    // مطابقة الجهاز
    if (license.hwid === hwid) {
      return res.status(200).json({ valid: true, message: 'الترخيص صالح' });
    } else {
      return res.status(401).json({ valid: false, message: 'المفتاح مستخدم على جهاز آخر' });
    }

  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message });
  }
}
