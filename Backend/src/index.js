const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Import routes and middleware
const userRoutes = require("./routes/users");
const songRoutes = require("./routes/songs");
const playlistRoutes = require("./routes/playlists");
const auth = require("./middleware/auth");

// Middleware
app.use(cors());
app.use(express.json());

// Public routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Melodify API" });
});

// Auth routes (public)
app.use("/api/users", userRoutes);

// Protected routes
app.use("/api/songs", auth, songRoutes);
app.use("/api/playlists", auth, playlistRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
