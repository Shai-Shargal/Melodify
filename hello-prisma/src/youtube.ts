import ytdl from "ytdl-core";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function downloadSong(youtubeUrl: string, userId: string) {
  try {
    // Validate YouTube URL
    if (!ytdl.validateURL(youtubeUrl)) {
      throw new Error("Invalid YouTube URL");
    }

    // Get video info
    const info = await ytdl.getInfo(youtubeUrl);
    const videoId = info.videoDetails.videoId;
    const title = info.videoDetails.title;
    const artist = info.videoDetails.author.name;
    const thumbnail = info.videoDetails.thumbnails[0]?.url;
    const duration = info.videoDetails.lengthSeconds.toString();

    // Check if song already exists
    const existingSong = await prisma.song.findUnique({
      where: { youtubeId: videoId },
    });

    if (existingSong) {
      return existingSong;
    }

    // Create songs directory if it doesn't exist
    const songsDir = path.join(process.cwd(), "songs");
    if (!fs.existsSync(songsDir)) {
      fs.mkdirSync(songsDir);
    }

    // Download audio
    const audioFormat = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
    });
    const outputPath = path.join(songsDir, `${videoId}.mp3`);

    const stream = ytdl(youtubeUrl, { format: audioFormat });
    const writeStream = fs.createWriteStream(outputPath);

    await new Promise((resolve, reject) => {
      stream.pipe(writeStream);
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    // Save song to database
    const song = await prisma.song.create({
      data: {
        title,
        artist,
        youtubeId: videoId,
        thumbnail,
        duration,
        userId,
      },
    });

    return song;
  } catch (error) {
    console.error("Error downloading song:", error);
    throw error;
  }
}

export async function getSongInfo(youtubeUrl: string) {
  try {
    if (!ytdl.validateURL(youtubeUrl)) {
      throw new Error("Invalid YouTube URL");
    }

    const info = await ytdl.getInfo(youtubeUrl);
    return {
      title: info.videoDetails.title,
      artist: info.videoDetails.author.name,
      thumbnail: info.videoDetails.thumbnails[0]?.url,
      duration: info.videoDetails.lengthSeconds.toString(),
      youtubeId: info.videoDetails.videoId,
    };
  } catch (error) {
    console.error("Error getting song info:", error);
    throw error;
  }
}
