import express, {
  Request,
  Response,
  RequestHandler,
  NextFunction,
} from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) {
  console.error("YouTube API key is not set in environment variables!");
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body,
  });
  next();
});

// Basic health check endpoint
app.get("/health", ((req: Request, res: Response) => {
  res.json({ status: "ok" });
}) as RequestHandler);

// Authentication middleware
const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};

// Auth routes
app.post("/auth/register", (async (req: Request, res: Response) => {
  console.log("Received registration request:", { body: req.body });
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return user data (excluding password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}) as RequestHandler);

app.post("/auth/login", (async (req: Request, res: Response) => {
  console.log("Received login request:", { body: req.body });
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return user data (excluding password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}) as RequestHandler);

app.get("/auth/me", authenticateToken, (async (req: Request, res: Response) => {
  console.log("Received /auth/me request:", {
    headers: req.headers,
    user: req.user,
  });
  try {
    if (!req.user) {
      console.log("No user found in request");
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      console.log("User not found in database:", req.user.userId);
      res.status(404).json({ error: "User not found" });
      return;
    }

    console.log("User found:", user);
    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}) as RequestHandler);

// Playlist routes
const createPlaylistHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("Received playlist creation request:", {
    body: req.body,
    user: req.user,
    headers: req.headers,
  });

  try {
    if (!req.user) {
      console.log("No user found in request");
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const { name, description } = req.body;
    const userId = req.user.userId;

    console.log("Creating playlist with data:", { name, description, userId });

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    console.log("Playlist created successfully:", playlist);
    res.status(201).json(playlist);
  } catch (error) {
    console.error("Create playlist error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPlaylistsHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const playlists = await prisma.playlist.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(playlists);
  } catch (error) {
    console.error("Get playlists error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete playlist
const deletePlaylistHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("Received delete playlist request:", {
    params: req.params,
    user: req.user,
    headers: req.headers,
  });

  try {
    if (!req.user) {
      console.log("No user found in request");
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const playlistId = req.params.id;
    const userId = req.user.userId;

    console.log("Attempting to delete playlist:", { playlistId, userId });

    // Verify playlist ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    console.log("Found playlist:", playlist);

    if (!playlist) {
      console.log("Playlist not found:", playlistId);
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    if (playlist.userId !== userId) {
      console.log("User not authorized:", {
        playlistUserId: playlist.userId,
        requestUserId: userId,
      });
      res.status(403).json({ error: "Not authorized to delete this playlist" });
      return;
    }

    // Delete playlist songs first
    console.log("Deleting playlist songs");
    await prisma.playlistSong.deleteMany({
      where: { playlistId },
    });

    // Delete the playlist
    console.log("Deleting playlist");
    await prisma.playlist.delete({
      where: { id: playlistId },
    });

    console.log("Playlist deleted successfully");
    res.status(200).json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("Delete playlist error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Register all playlist routes together
app.post("/playlists", authenticateToken, createPlaylistHandler);
app.get("/playlists", authenticateToken, getPlaylistsHandler);
app.delete("/playlists/:id", authenticateToken, deletePlaylistHandler);

// Song management endpoints
const getSongsHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const songs = await prisma.song.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
};

const createSongHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!YOUTUBE_API_KEY) {
      res.status(500).json({ error: "YouTube API key is not configured" });
      return;
    }

    const { youtubeUrl } = req.body;
    if (!youtubeUrl) {
      res.status(400).json({ error: "YouTube URL is required" });
      return;
    }

    console.log("Processing YouTube URL:", youtubeUrl);

    // Extract YouTube ID from URL (handling different URL formats)
    let youtubeId: string | undefined;

    // Handle youtu.be format
    if (youtubeUrl.includes("youtu.be/")) {
      youtubeId = youtubeUrl.split("youtu.be/")[1]?.split("?")[0];
    }
    // Handle youtube.com format
    else if (youtubeUrl.includes("youtube.com/watch")) {
      youtubeId = youtubeUrl.split("v=")[1]?.split("&")[0];
    }
    // Handle youtube.com/shorts format
    else if (youtubeUrl.includes("youtube.com/shorts/")) {
      youtubeId = youtubeUrl.split("shorts/")[1]?.split("?")[0];
    }

    if (!youtubeId) {
      res.status(400).json({ error: "Invalid YouTube URL format" });
      return;
    }

    console.log("Extracted YouTube ID:", youtubeId);

    try {
      // Get video info from YouTube Data API
      console.log("Fetching video info from YouTube API...");
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${youtubeId}&key=${YOUTUBE_API_KEY}`;
      console.log("API URL:", apiUrl.replace(YOUTUBE_API_KEY, "REDACTED"));

      const response = await axios.get(apiUrl);

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error("Video not found");
      }

      const videoInfo = response.data.items[0].snippet;
      console.log("Video info received:", {
        title: videoInfo.title,
        channelTitle: videoInfo.channelTitle,
        thumbnailUrl: videoInfo.thumbnails.high?.url,
      });

      // Create song with actual video info
      console.log("Creating song in database...");
      const song = await prisma.song.create({
        data: {
          title: videoInfo.title,
          artist: videoInfo.channelTitle,
          youtubeId,
          thumbnail: videoInfo.thumbnails.high?.url || null,
          user: {
            connect: {
              id: req.user.userId,
            },
          },
        },
      });

      console.log("Song created successfully:", song);
      res.status(201).json(song);
    } catch (apiError) {
      console.error("YouTube API error:", apiError);
      if (axios.isAxiosError(apiError)) {
        console.error("API Error details:", {
          status: apiError.response?.status,
          data: apiError.response?.data,
        });
      }
      res.status(500).json({
        error: "Failed to fetch video information",
        details: apiError instanceof Error ? apiError.message : "Unknown error",
      });
    }
  } catch (error) {
    console.error("Error creating song:", error);
    res.status(500).json({
      error: "Failed to create song",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const deleteSongHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const songId = req.params.id;
    const song = await prisma.song.findUnique({
      where: { id: songId },
    });

    if (!song) {
      res.status(404).json({ error: "Song not found" });
      return;
    }

    if (song.userId !== req.user.userId) {
      res.status(403).json({ error: "Not authorized to delete this song" });
      return;
    }

    await prisma.song.delete({
      where: { id: songId },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting song:", error);
    res.status(500).json({ error: "Failed to delete song" });
  }
};

// PATCH endpoint to update song metadata
app.patch(
  "/songs/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const songId = req.params.id;
      const { rating, purpose, emotionalState, isLiked, genre } = req.body;

      // Find the song and check ownership
      const song = await prisma.song.findUnique({ where: { id: songId } });
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }
      if (song.userId !== req.user.userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this song" });
      }

      // Only update provided fields
      const updateData: any = {};
      if (rating !== undefined) updateData.rating = rating;
      if (purpose !== undefined) updateData.purpose = purpose;
      if (emotionalState !== undefined)
        updateData.emotionalState = emotionalState;
      if (isLiked !== undefined) updateData.isLiked = isLiked;
      if (genre !== undefined) updateData.genre = genre;

      const updatedSong = await prisma.song.update({
        where: { id: songId },
        data: updateData,
      });
      res.json(updatedSong);
    } catch (error) {
      console.error("Error updating song metadata:", error);
      res.status(500).json({ error: "Failed to update song metadata" });
    }
  }
);

// Register song routes
app.get("/songs", authenticateToken, getSongsHandler);
app.post("/songs", authenticateToken, createSongHandler);
app.delete("/songs/:id", authenticateToken, deleteSongHandler);

// Add song to playlist endpoint
app.post(
  "/playlists/:playlistId/songs",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { playlistId } = req.params;
      const { songId } = req.body;

      if (!songId) {
        return res.status(400).json({ error: "Song ID is required" });
      }

      const playlist = await prisma.playlist.findUnique({
        where: { id: playlistId },
      });

      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }

      if (playlist.userId !== (req as any).user.userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to modify this playlist" });
      }

      const song = await prisma.song.findUnique({
        where: { id: songId },
      });

      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }

      // Add song to playlist
      await prisma.playlistSong.create({
        data: {
          playlistId,
          songId,
        },
      });

      res.status(201).json({ message: "Song added to playlist" });
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      res.status(500).json({ error: "Failed to add song to playlist" });
    }
  }
);

// Get all songs in a playlist
app.get(
  "/playlists/:playlistId/songs",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { playlistId } = req.params;
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      // Check playlist ownership
      const playlist = await prisma.playlist.findUnique({
        where: { id: playlistId },
        include: { songs: true },
      });
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      if (playlist.userId !== req.user.userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to view this playlist" });
      }
      // Get songs in playlist
      const playlistSongs = await prisma.playlistSong.findMany({
        where: { playlistId },
        include: { song: true },
        orderBy: { createdAt: "asc" },
      });
      const songs = playlistSongs.map((ps) => ps.song);
      res.json(songs);
    } catch (error) {
      console.error("Error fetching playlist songs:", error);
      res.status(500).json({ error: "Failed to fetch playlist songs" });
    }
  }
);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log("Registered routes:");
  const routes = app._router?.stack
    .filter((middleware: any) => middleware.route)
    .map((middleware: any) => {
      const methods = Object.keys(middleware.route.methods)
        .join(", ")
        .toUpperCase();
      return `${methods} ${middleware.route.path}`;
    });
  console.log(routes || "No routes found");
});
