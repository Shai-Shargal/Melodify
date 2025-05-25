const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const auth = require("../middleware/auth");

// Apply auth middleware to all routes
router.use(auth);

// Get all playlists
router.get("/", async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: {
        userId: req.userId,
      },
      include: {
        user: true,
        songs: true,
      },
    });
    res.json(playlists);
  } catch (error) {
    console.error("Error fetching playlists:", error);
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
    console.log("Creating playlist with data:", {
      body: req.body,
      userId: req.userId,
      headers: req.headers,
    });

    const { name, songs } = req.body;

    if (!name) {
      console.error("Missing playlist name");
      return res.status(400).json({ error: "Playlist name is required" });
    }

    if (!req.userId) {
      console.error("Missing userId in request");
      return res.status(400).json({ error: "User ID is required" });
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        userId: req.userId,
        songs: {
          connect: songs?.map((id) => ({ id })) || [],
        },
      },
      include: {
        songs: true,
      },
    });
    console.log("Created playlist:", playlist);
    res.json(playlist);
  } catch (error) {
    console.error("Error creating playlist:", error);
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

// Add song to playlist
router.post("/:id/songs", async (req, res) => {
  try {
    const { songId } = req.body;
    console.log("Adding song to playlist:", {
      playlistId: req.params.id,
      songId: songId,
      body: req.body,
    });

    if (!songId) {
      return res.status(400).json({ error: "songId is required" });
    }

    const playlist = await prisma.playlist.update({
      where: { id: req.params.id },
      data: {
        songs: {
          connect: { id: songId },
        },
      },
      include: {
        songs: true,
      },
    });
    res.json(playlist);
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
