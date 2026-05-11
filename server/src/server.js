const express = require("express");
const cors = require("cors");
require("dotenv").config();

const zoneRoutes = require("./routes/zone.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Crystal Idle MVP API is running",
    version: "0.1.0",
  });
});

app.use("/zones", zoneRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});