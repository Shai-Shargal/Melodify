import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      password: "password123", // In a real app, this should be hashed
    },
  });

  // Create some songs
  const songs = await Promise.all([
    prisma.song.create({
      data: {
        title: "Bohemian Rhapsody",
        artist: "Queen",
        youtubeId: "fJ9rUzIMcZQ",
        thumbnail: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg",
        duration: "5:55",
        genre: "Rock",
        rating: 5,
        isLiked: true,
        userId: user.id,
      },
    }),
    prisma.song.create({
      data: {
        title: "Shape of You",
        artist: "Ed Sheeran",
        youtubeId: "JGwWNGJdvx8",
        thumbnail: "https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg",
        duration: "3:53",
        genre: "Pop",
        rating: 4,
        isLiked: false,
        userId: user.id,
      },
    }),
    prisma.song.create({
      data: {
        title: "Blinding Lights",
        artist: "The Weeknd",
        youtubeId: "4NRXx6U8ABQ",
        thumbnail: "https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg",
        duration: "3:20",
        genre: "Pop",
        rating: 5,
        isLiked: true,
        userId: user.id,
      },
    }),
  ]);

  // Create a playlist with the songs
  await prisma.playlist.create({
    data: {
      name: "My Favorite Songs",
      description: "A collection of my favorite songs",
      userId: user.id,
      songs: {
        connect: songs.map((song) => ({ id: song.id })),
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
