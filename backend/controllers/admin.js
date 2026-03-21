const User = require("../models/user");
const Result = require("../models/result");
const Draw = require("../models/draw");
const Charity = require("../models/charity");
const { buildDrawSummary, executeDraw } = require("../service/draw");
const { sendWinnerStatusNotification } = require("../service/notifications");

const getCharityContributionAmount = (user) => {
  const amount = Number(user?.subscription?.amount || 0);
  const percent = Number(user?.charity?.contributionPercent || 10);
  return Number(((amount * percent) / 100).toFixed(2));
};

const ensureWinningResult = (result, res) => {
  if (Number(result?.prize || 0) <= 0) {
    res.status(400).json({ message: "Only winner records can be reviewed" });
    return false;
  }

  return true;
};

exports.runDraw = async (req, res) => {
  try {
    const mode = String(req.body?.mode || "random").toLowerCase();
    const simulation = Boolean(req.body?.simulation);
    const summary = simulation ? await buildDrawSummary(mode) : await executeDraw(mode);

    res.json({
      message: simulation ? "Draw simulation generated successfully" : "Draw published successfully",
      simulation,
      drawNumbers: summary.drawNumbers,
      mode: summary.mode,
      participants: summary.participants,
      totalPool: summary.totalPool,
      winners: summary.winners,
      results: summary.results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Draw failed" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-passwordHash -__v")
      .populate("charity.charityId", "name category");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("userId", "firstName lastName email username")
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const [users, results, draws, charities] = await Promise.all([
      User.find().populate("charity.charityId", "name"),
      Result.find(),
      Draw.find().sort({ createdAt: -1 }).limit(12),
      Charity.find().sort({ featured: -1, name: 1 }),
    ]);

    const totalPrizeDistributed = results.reduce((sum, entry) => sum + Number(entry.prize || 0), 0);
    const activeSubscribers = users.filter(
      (user) => String(user.subscription?.status || "").toLowerCase() === "active"
    );
    const charityContributionTotal = activeSubscribers.reduce(
      (sum, user) => sum + getCharityContributionAmount(user),
      0
    );

    const charityBreakdown = charities.map((charity) => {
      const supporters = activeSubscribers.filter(
        (user) => String(user.charity?.charityId?._id || user.charity?.charityId || "") === String(charity._id)
      );

      return {
        id: charity._id,
        name: charity.name,
        supporters: supporters.length,
        contributionTotal: supporters.reduce(
          (sum, user) => sum + getCharityContributionAmount(user),
          0
        ),
      };
    });

    res.json({
      totalUsers: users.length,
      activeSubscribers: activeSubscribers.length,
      totalPrizeDistributed,
      totalResults: results.length,
      totalDraws: draws.length,
      charityContributionTotal,
      pendingVerifications: results.filter((entry) => entry.status === "pending" && entry.prize > 0).length,
      draws,
      charityBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyWinner = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    if (!ensureWinningResult(result, res)) {
      return;
    }

    if (!result.proofUrl) {
      return res.status(400).json({ message: "Proof submission is required before verification" });
    }

    if (result.status === "paid") {
      return res.status(400).json({ message: "Paid winners cannot be reviewed again" });
    }

    result.status = "verified";
    result.adminNote = req.body.adminNote || result.adminNote;
    result.reviewedAt = new Date();
    await result.save();

    const populated = await Result.findById(result._id).populate(
      "userId",
      "firstName lastName email username"
    );
    sendWinnerStatusNotification({ user: populated.userId, result: populated, status: "verified" });
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectWinner = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    if (!ensureWinningResult(result, res)) {
      return;
    }

    if (!result.proofUrl) {
      return res.status(400).json({ message: "Reject actions apply to submitted proof only" });
    }

    if (result.status === "paid") {
      return res.status(400).json({ message: "Paid winners cannot be rejected" });
    }

    result.status = "rejected";
    result.adminNote = req.body.adminNote || "Proof rejected";
    result.reviewedAt = new Date();
    await result.save();

    const populated = await Result.findById(result._id).populate(
      "userId",
      "firstName lastName email username"
    );
    sendWinnerStatusNotification({ user: populated.userId, result: populated, status: "rejected" });
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    if (!ensureWinningResult(result, res)) {
      return;
    }

    if (result.status !== "verified") {
      return res.status(400).json({ message: "Only verified winners can be marked as paid" });
    }

    result.status = "paid";
    result.adminNote = req.body.adminNote || result.adminNote;
    result.reviewedAt = result.reviewedAt || new Date();
    result.payoutCompletedAt = new Date();
    await result.save();

    const populated = await Result.findById(result._id).populate(
      "userId",
      "firstName lastName email username"
    );
    sendWinnerStatusNotification({ user: populated.userId, result: populated, status: "paid" });
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
