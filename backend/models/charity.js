const mongoose = require("mongoose");

const charitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    category: { type: String, default: "Community" },
    location: { type: String, default: "India" },
    description: { type: String, required: true },
    impact: { type: String, default: "" },
    image: { type: String, default: "" },
    gallery: [{ type: String }],
    upcomingEvents: [
      {
        title: { type: String, required: true },
        date: { type: Date, required: true },
        location: { type: String, default: "" },
        description: { type: String, default: "" }
      }
    ],
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Charity", charitySchema);
