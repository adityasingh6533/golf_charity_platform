const mongoose = require("mongoose");

let cachedConnectionPromise = null;

const connectToMongoDB = async (url) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedConnectionPromise) {
    cachedConnectionPromise = mongoose.connect(url);
  }

  try {
    return await cachedConnectionPromise;
  } catch (error) {
    cachedConnectionPromise = null;
    throw error;
  }
};

module.exports = connectToMongoDB;
