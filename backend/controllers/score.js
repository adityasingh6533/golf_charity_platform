const Score = require("../models/score");

const normalizeEntries = (scores) => {
  return scores
    .map((score) => {
      if (typeof score === "object" && score !== null) {
        return {
          value: Number(score.value),
          date: score.date ? new Date(score.date) : new Date(),
        };
      }

      return {
        value: Number(score),
        date: new Date(),
      };
    })
    .filter(
      (entry) =>
        Number.isFinite(entry.value) &&
        entry.value > 0 &&
        entry.value <= 45 &&
        entry.date instanceof Date &&
        !Number.isNaN(entry.date.getTime())
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);
};

exports.saveScore = async (req, res) => {
  try {
    const { userId, scores } = req.body;

    if (!userId || !Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({ message: "User id and scores are required" });
    }

    if (req.user.id !== String(userId) && String(req.user.role || "").toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const entries = normalizeEntries(scores);

    if (entries.length === 0) {
      return res.status(400).json({ message: "Please enter valid scores between 1 and 45" });
    }

    const savedScore = await Score.findOneAndUpdate(
      { userId },
      {
        userId,
        scores: entries.map((entry) => entry.value),
        entries,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      message: "Scores saved successfully",
      score: savedScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserScores = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User id is required" });
    }

    if (req.user.id !== String(userId) && String(req.user.role || "").toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const score = await Score.findOne({ userId }).sort({ createdAt: -1 });
    res.json(score || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
