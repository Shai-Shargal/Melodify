import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { downloadSong, getSongInfo } from "./youtube";

const prisma = new PrismaClient().$extends(withAccelerate());

// A `main` function so that we can use async/await
async function main() {
  const user1Email = `alice${Date.now()}@prisma.io`;
  const user2Email = `bob${Date.now()}@prisma.io`;

  // Seed the database with users and posts
  const user1 = await prisma.user.create({
    data: {
      email: user1Email,
      name: "Alice",
      posts: {
        create: {
          title: "Join the Prisma community on Discord",
          content: "https://pris.ly/discord",
          published: true,
        },
      },
    },
    include: {
      posts: true,
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: user2Email,
      name: "Bob",
      posts: {
        create: [
          {
            title: "Check out Prisma on YouTube",
            content: "https://pris.ly/youtube",
            published: true,
          },
          {
            title: "Follow Prisma on Twitter",
            content: "https://twitter.com/prisma/",
            published: false,
          },
        ],
      },
    },
    include: {
      posts: true,
    },
  });
  console.log(
    `Created users: ${user1.name} (${user1.posts.length} post) and ${user2.name} (${user2.posts.length} posts) `
  );

  // Retrieve all published posts
  const allPosts = await prisma.post.findMany({
    where: { published: true },
  });
  console.log(`Retrieved all published posts: ${JSON.stringify(allPosts)}`);

  // Create a new post (written by an already existing user with email alice@prisma.io)
  const newPost = await prisma.post.create({
    data: {
      title: "Join the Prisma Discord community",
      content: "https://pris.ly/discord",
      published: false,
      author: {
        connect: {
          email: user1Email,
        },
      },
    },
  });
  console.log(`Created a new post: ${JSON.stringify(newPost)}`);

  // Publish the new post
  const updatedPost = await prisma.post.update({
    where: {
      id: newPost.id,
    },
    data: {
      published: true,
    },
  });
  console.log(
    `Published the newly created post: ${JSON.stringify(updatedPost)}`
  );

  // Retrieve all posts by user with email alice@prisma.io
  const postsByUser = await prisma.post.findMany({
    where: {
      author: {
        email: user1Email,
      },
    },
  });
  console.log(
    `Retrieved all posts from a specific user: ${JSON.stringify(postsByUser)}`
  );
}

export async function addSongFromYouTube(youtubeUrl: string, userId: string) {
  try {
    const song = await downloadSong(youtubeUrl, userId);
    return song;
  } catch (error) {
    console.error("Error adding song from YouTube:", error);
    throw error;
  }
}

export async function getSongPreview(youtubeUrl: string) {
  try {
    const songInfo = await getSongInfo(youtubeUrl);
    return songInfo;
  } catch (error) {
    console.error("Error getting song preview:", error);
    throw error;
  }
}

export async function getUserSongs(userId: string) {
  try {
    const songs = await prisma.song.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return songs;
  } catch (error) {
    console.error("Error getting user songs:", error);
    throw error;
  }
}

export async function updateSongMetadata(
  songId: string,
  data: {
    genre?: string;
    purpose?: string;
    emotionalState?: string;
    rating?: number;
    isLiked?: boolean;
  }
) {
  try {
    const song = await prisma.song.update({
      where: { id: songId },
      data,
    });
    return song;
  } catch (error) {
    console.error("Error updating song metadata:", error);
    throw error;
  }
}

export async function deleteSong(songId: string) {
  try {
    const song = await prisma.song.delete({
      where: { id: songId },
    });
    return song;
  } catch (error) {
    console.error("Error deleting song:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
