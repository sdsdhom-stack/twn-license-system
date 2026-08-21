module.exports = (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ status: "error", message: "License key required" });
  }

  // رد افتراضي مبدئي
  res.status(200).json({
    status: "success",
    license_key: key,
    valid: true,
    message: "License verified successfully"
  });
};
