module.exports = (req, res) => {
  res.status(200).json({
    status: "online",
    message: "TwnTool Server API is running smoothly",
    timestamp: new Date().toISOString()
  });
};
