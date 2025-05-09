import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Example queries
  try {
    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
        password: "hashedpassword123", // In a real app, this should be properly hashed
      },
    });
    console.log("Created new user:", newUser);

    // Create a new song
    const newSong = await prisma.song.create({
      data: {
        title: "Test Song",
        artist: "Test Artist",
        youtubeId: "abc123",
        userId: newUser.id,
      },
    });
    console.log("Created new song:", newSong);

    // Create a playlist
    const newPlaylist = await prisma.playlist.create({
      data: {
        name: "My Playlist",
        description: "A test playlist",
        userId: newUser.id,
      },
    });
    console.log("Created new playlist:", newPlaylist);

    // Add song to playlist
    const updatedPlaylist = await prisma.playlist.update({
      where: { id: newPlaylist.id },
      data: {
        songs: {
          connect: { id: newSong.id },
        },
      },
      include: {
        songs: true,
      },
    });
    console.log("Updated playlist with song:", updatedPlaylist);

    // Query all users with their songs and playlists
    const allUsers = await prisma.user.findMany({
      include: {
        songs: true,
        playlists: true,
      },
    });
    console.log("All users with their data:", allUsers);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
