const Draw = require("../models/draw");
const Result = require("../models/result");
const Score = require("../models/score");
const User = require("../models/user");
const { PLAN_AMOUNTS } = require("./subscription");

const createRandomDrawNumbers = () => {
  const numbers = new Set();

  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(numbers);
};

const createAlgorithmDrawNumbers = (scoreDocs) => {
  const frequency = new Map();

  scoreDocs.forEach((doc) => {
    doc.scores.forEach((score) => {
      const next = (frequency.get(score) || 0) + 1;
      frequency.set(score, next);
    });
  });

  const sorted = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, 5)
    .map(([score]) => score);

  if (sorted.length < 5) {
    const fallback = createRandomDrawNumbers();
    fallback.forEach((num) => {
      if (!sorted.includes(num) && sorted.length < 5) {
        sorted.push(num);
      }
    });
  }

  return sorted;
};

const getSubscriptionAmount = (user) => {
  const explicitAmount = Number(user?.subscription?.amount || 0);
  if (explicitAmount > 0) return explicitAmount;

  return PLAN_AMOUNTS[user?.subscription?.plan] || PLAN_AMOUNTS.monthly;
};

const executeDraw = async (mode = "random") => {
  const users = await User.find({ "subscription.status": "active" });
  const activeUserIds = users.map((user) => String(user._id));
  const scoreDocs = await Score.find({ userId: { $in: activeUserIds } }).sort({ createdAt: -1 });

  const eligibleUsersById = new Map(users.map((user) => [String(user._id), user]));
  const eligibleScores = scoreDocs.filter((doc) => eligibleUsersById.has(String(doc.userId)));

  const drawNumbers =
    mode === "algorithm" ? createAlgorithmDrawNumbers(eligibleScores) : createRandomDrawNumbers();

  const participants = eligibleScores.map((entry) => {
    const user = eligibleUsersById.get(String(entry.userId));
    const matchCount = entry.scores.reduce((count, score) => {
      return drawNumbers.includes(score) ? count + 1 : count;
    }, 0);

    return {
      userId: entry.userId,
      user,
      matches: matchCount,
    };
  });

  const totalPool = participants.reduce((sum, participant) => {
    return sum + getSubscriptionAmount(participant.user);
  }, 0);

  const winners5 = participants.filter((entry) => entry.matches === 5);
  const winners4 = participants.filter((entry) => entry.matches === 4);
  const winners3 = participants.filter((entry) => entry.matches === 3);
  const prizeMap = new Map();

  const assignPrize = (winners, percent) => {
    if (!winners.length) return;

    const prizeEach = Number(((totalPool * percent) / winners.length).toFixed(2));
    winners.forEach((winner) => {
      prizeMap.set(String(winner.userId), prizeEach);
    });
  };

  assignPrize(winners5, 0.4);
  assignPrize(winners4, 0.35);
  assignPrize(winners3, 0.25);

  await Draw.create({
    numbers: drawNumbers,
    mode,
    participantCount: participants.length,
    totalPool,
  });

  const results = [];

  for (const participant of participants) {
    const prize = prizeMap.get(String(participant.userId)) || 0;
    const result = await Result.create({
      userId: participant.userId,
      matches: participant.matches,
      prize,
      status: prize > 0 ? "pending" : "lost",
      draw: drawNumbers,
    });

    results.push(result);
  }

  return {
    drawNumbers,
    mode,
    totalPool,
    participants: participants.length,
    winners: {
      five: winners5.length,
      four: winners4.length,
      three: winners3.length,
    },
    results,
  };
};

module.exports = {
  executeDraw,
  PLAN_AMOUNTS,
};
