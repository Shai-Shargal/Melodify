const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const auth = require("../middleware/auth");

// Apply auth middleware to all routes
router.use(auth);

// Get all songs
router.get("/", async (req, res) => {
  try {
    const songs = await prisma.song.findMany({
      where: {
        userId: req.userId,
      },
      include: {
        user: true,
        playlists: true,
      },
    });
    res.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get song by ID
router.get("/:id", async (req, res) => {
  try {
    const song = await prisma.song.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        playlists: true,
      },
    });
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new song
router.post("/", async (req, res) => {
  try {
    const {
      title,
      artist,
      youtubeId,
      thumbnail,
      duration,
      genre,
      purpose,
      emotionalState,
      userId,
    } = req.body;
    const song = await prisma.song.create({
      data: {
        title,
        artist,
        youtubeId,
        thumbnail,
        duration,
        genre,
        purpose,
        emotionalState,
        userId,
      },
    });
    res.json(song);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update song
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      artist,
      youtubeId,
      thumbnail,
      duration,
      genre,
      purpose,
      emotionalState,
      rating,
      isLiked,
    } = req.body;
    const song = await prisma.song.update({
      where: { id },
      data: {
        title,
        artist,
        youtubeId,
        thumbnail,
        duration,
        genre,
        purpose,
        emotionalState,
        rating,
        isLiked,
      },
    });
    res.json(song);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete song
router.delete("/:id", async (req, res) => {
  try {
    await prisma.song.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Song deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
