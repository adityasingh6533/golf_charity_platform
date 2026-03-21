require("dotenv").config();

const { app, ensureAppReady } = require("./app");

const PORT = process.env.PORT || 5000;

ensureAppReady()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start backend", error);
    process.exit(1);
  });
