const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all songs
router.get("/", async (req, res) => {
  try {
    const songs = await prisma.song.findMany({
      include: {
        user: true,
        playlists: true,
      },
    });
    res.json(songs);
  } catch (error) {
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

// Update song
router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      artist,
      youtubeId,
      thumbnail,
      duration,
      genre,
      rating,
      isLiked,
    } = req.body;
    const song = await prisma.song.update({
      where: { id: req.params.id },
      data: {
        title,
        artist,
        youtubeId,
        thumbnail,
        duration,
        genre,
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
