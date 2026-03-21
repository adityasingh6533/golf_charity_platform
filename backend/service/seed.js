const Charity = require("../models/charity");

const defaultCharities = [
  {
    name: "Green Fairways Foundation",
    category: "Environment",
    location: "Delhi",
    description: "Restoring green community spaces and funding climate-positive youth golf initiatives.",
    impact: "142 school eco-sports kits funded this year.",
    image: "",
    gallery: [],
    upcomingEvents: [
      {
        title: "City Green Golf Day",
        date: new Date("2026-04-18"),
        location: "Delhi NCR",
        description: "A local fundraising golf day focused on youth eco-sport programs."
      }
    ],
    featured: true,
  },
  {
    name: "Swing for Smiles",
    category: "Healthcare",
    location: "Mumbai",
    description: "Helping children access cancer support, recovery care, and activity-led confidence programs.",
    impact: "Supported 380 family care sessions.",
    image: "",
    gallery: [],
    upcomingEvents: [
      {
        title: "Hope Cup Charity Evening",
        date: new Date("2026-05-03"),
        location: "Mumbai",
        description: "A donor evening funding family recovery and patient wellness support."
      }
    ],
    featured: true,
  },
  {
    name: "Rural Sports Spark",
    category: "Education",
    location: "Jaipur",
    description: "Building sports access, digital literacy, and coaching pathways for small-town students.",
    impact: "Set up 28 rural coaching camps.",
    image: "",
    gallery: [],
    upcomingEvents: [
      {
        title: "Village Fairway Camp",
        date: new Date("2026-04-27"),
        location: "Jaipur",
        description: "Community coaching camp to launch new sports kits and mentorship sessions."
      }
    ],
    featured: false,
  },
];

const seedLocalData = async () => {
  for (const charity of defaultCharities) {
    await Charity.findOneAndUpdate(
      { name: charity.name },
      {
        $set: {
          category: charity.category,
          location: charity.location,
          description: charity.description,
          impact: charity.impact,
          image: charity.image,
          gallery: charity.gallery,
          upcomingEvents: charity.upcomingEvents,
          featured: charity.featured,
          active: true,
        },
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
        returnDocument: "after",
      }
    );
  }
};

module.exports = {
  seedLocalData,
};
