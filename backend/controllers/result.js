const Result = require("../models/result");

exports.getLeaderboard = async (req, res) => {
  try {
    const data = await Result.find()
      .populate("userId", "firstName lastName email")
      .sort({ prize: -1, matches: -1, createdAt: -1 })
      .limit(12);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserResults = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User id is required" });
    }

    if (req.user.id !== String(userId) && String(req.user.role || "").toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const results = await Result.find({ userId }).sort({ createdAt: 1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitWinnerProof = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { proofUrl = "", proofNote = "" } = req.body;

    const result = await Result.findById(resultId);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    if (req.user.id !== String(result.userId) && String(req.user.role || "").toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (Number(result.prize || 0) <= 0) {
      return res.status(400).json({ message: "Only winners can submit proof" });
    }

    result.proofUrl = proofUrl;
    result.proofNote = proofNote;
    result.status = "pending";
    await result.save();

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
