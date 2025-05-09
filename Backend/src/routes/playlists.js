const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all playlists
router.get("/", async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      include: {
        user: true,
        songs: true,
      },
    });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get playlist by ID
router.get("/:id", async (req, res) => {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        songs: true,
      },
    });
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new playlist
router.post("/", async (req, res) => {
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

// Update playlist
router.put("/:id", async (req, res) => {
  try {
    const { name, description, songs } = req.body;
    const playlist = await prisma.playlist.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        songs: {
          set: songs.map((id) => ({ id })),
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

// Delete playlist
router.delete("/:id", async (req, res) => {
  try {
    await prisma.playlist.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Playlist deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
