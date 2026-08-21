const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

module.exports = async (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ valid: false, message: "License key required" });
  }

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ valid: false, message: "Database config missing" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('licenses')
    .select('*')
    .eq('license_key', key)
    .single();

  if (error || !data) {
    return res.status(200).json({ valid: false, message: "Invalid license" });
  }

  return res.status(200).json({ 
    valid: true, 
    message: "License verified successfully",
    email: data.email,
    expiry_date: data.expiry_date
  });
};
