module.exports = async (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ valid: false, message: "License key required" });
  }

  let supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ valid: false, message: "Missing Environment Variables in Vercel" });
  }

  // الإصلاح التلقائي: استخراج الرابط الأساسي فقط وحذف أي زيادات منسوخة بالخطأ
  try {
    const parsedUrl = new URL(supabaseUrl);
    supabaseUrl = parsedUrl.origin; 
  } catch(e) {}

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/licenses?license_key=eq.${encodeURIComponent(key)}`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({ valid: false, message: "Supabase Connection Error", details: data });
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ valid: false, message: "Invalid license" });
    }

    const license = data[0];

    return res.status(200).json({
      valid: true,
      message: "License verified successfully",
      email: license.email,
      expiry_date: license.expiry_date
    });

  } catch (err) {
    return res.status(500).json({ valid: false, message: "Server error", error: err.message });
  }
};
