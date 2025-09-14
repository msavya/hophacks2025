const express = require("express");
const app = express();
const charitiesRoutes = require("./routes/charities");

app.use(express.json());
app.use("/api/charities", charitiesRoutes);

app.listen(3001, () => console.log("Server running on port 3001"));

require("dotenv").config();
