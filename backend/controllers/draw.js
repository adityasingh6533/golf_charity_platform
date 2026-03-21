const { executeDraw } = require("../service/draw");

exports.runDraw = async (req, res) => {
  try {
    const mode = String(req.body?.mode || "random").toLowerCase();
    const summary = await executeDraw(mode);

    res.json({
      message: "Draw completed successfully",
      drawNumbers: summary.drawNumbers,
      mode: summary.mode,
      participants: summary.participants,
      totalPool: summary.totalPool,
      winners: summary.winners
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to complete draw" });
  }
};
