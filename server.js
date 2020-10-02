const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const favicon = require("serve-favicon");

const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

const connectDB = require("./config/db");
connectDB();

app.use(express.static("public"));

app.use("/api/items", require("./routes/api/items"));
app.use("/api/orders", require("./routes/api/orders"));

const port = process.env.PORT || 5000;
app.listen(port, console.log(`Server on port ${port}...`));
