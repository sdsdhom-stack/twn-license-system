module.exports = (req, res) => {
  res.status(200).json({
    auth_service: "TwnTool Auth Engine",
    status: "active"
  });
};
