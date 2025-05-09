const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Import routes
const userRoutes = require("./routes/users");
const songRoutes = require("./routes/songs");
const playlistRoutes = require("./routes/playlists");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Melodify API" });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);

// User routes
app.post("/api/users/register", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password, // Note: In production, hash the password!
      },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Song routes
app.get("/api/songs", async (req, res) => {
  try {
    const songs = await prisma.song.findMany();
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/songs", async (req, res) => {
  try {
    const { title, artist, youtubeId, thumbnail, duration, genre, userId } =
      req.body;
    const song = await prisma.song.create({
      data: {
        title,
        artist,
        youtubeId,
        thumbnail,
        duration,
        genre,
        userId,
      },
    });
    res.json(song);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Playlist routes
app.get("/api/playlists", async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      include: {
        songs: true,
      },
    });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/playlists", async (req, res) => {
  try {
    const { name, description, userId, songs } = req.body;
    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        userId,
        songs: {
          connect: songs.map((id) => ({ id })),
        },
      },
      include: {
        songs: true,
      },
    });
    res.json(playlist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
