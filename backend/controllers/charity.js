const Charity = require("../models/charity");
const Donation = require("../models/donation");

exports.getCharities = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();

    const query = { active: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { impact: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const charities = await Charity.find(query).sort({ featured: -1, name: 1 });
    res.json(charities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCharityById = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);

    if (!charity || !charity.active) {
      return res.status(404).json({ message: "Charity not found" });
    }

    const donations = await Donation.find({ charityId: charity._id })
      .sort({ createdAt: -1 })
      .limit(8)
      .select("donorName amount note createdAt");

    const donationTotal = await Donation.aggregate([
      { $match: { charityId: charity._id } },
      { $group: { _id: "$charityId", total: { $sum: "$amount" } } }
    ]);

    res.json({
      charity,
      donations,
      donationTotal: donationTotal[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDonation = async (req, res) => {
  try {
    const { charityId, amount, donorName, donorEmail, note } = req.body;

    if (!charityId || !amount) {
      return res.status(400).json({ message: "Charity and amount are required" });
    }

    const charity = await Charity.findById(charityId);
    if (!charity) {
      return res.status(404).json({ message: "Charity not found" });
    }

    const donation = await Donation.create({
      charityId,
      userId: req.user?.id || null,
      donorName: donorName || req.user?.email || "Anonymous",
      donorEmail: donorEmail || req.user?.email || "",
      amount: Number(amount),
      note: note || "",
      source: "independent",
    });

    res.status(201).json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getFeaturedCharities = async (req, res) => {
  try {
    const charities = await Charity.find({ active: true, featured: true }).sort({ name: 1 }).limit(3);
    res.json(charities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCharity = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const description = String(req.body?.description || "").trim();

    if (!name || !description) {
      return res.status(400).json({ message: "Charity name and description are required" });
    }

    const existingCharity = await Charity.findOne({
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });

    if (existingCharity) {
      return res.status(409).json({ message: `${name} already exists in the charity directory` });
    }

    const charity = await Charity.create({
      ...req.body,
      name,
      description,
    });
    res.status(201).json(charity);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "This charity already exists in the directory" });
    }

    res.status(400).json({ message: error.message });
  }
};

exports.updateCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!charity) {
      return res.status(404).json({ message: "Charity not found" });
    }

    res.json(charity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndDelete(req.params.id);

    if (!charity) {
      return res.status(404).json({ message: "Charity not found" });
    }

    res.json({ message: "Charity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
