const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const db = require("./config/firebase"); // Pastikan file ini ada!

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); // Hanya panggil sekali
app.set("view engine", "ejs"); // Untuk render halaman dengan EJS

// Import Routes
const indexRoutes = require("./routes/index");
const apiRoutes = require("./routes/api");
const articleRoutes = require("./routes/articles"); // Pastikan file ini ada

// Gunakan Routes
app.use("/", indexRoutes);
app.use("/api", apiRoutes);
app.use("/articles", articleRoutes); // Pastikan ini sudah ada

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
