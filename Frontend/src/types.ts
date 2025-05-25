export interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnail: string;
  duration: string;
  genre: string;
  rating: number;
  isLiked: boolean;
  purpose?: string;
  emotionalState?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  genre?: string;
  emotionalState?: string;
  numberOfSongs?: number;
  purpose?: string;
}

export enum Genre {
  Pop = "Pop",
  Rock = "Rock",
  HipHop = "Hip Hop",
  Jazz = "Jazz",
  Classical = "Classical",
  Electronic = "Electronic",
  RAndB = "R&B",
  Country = "Country",
  Metal = "Metal",
  Folk = "Folk",
  Custom = "Custom",
}

export enum EmotionalState {
  Happy = "Happy",
  Sad = "Sad",
  Energetic = "Energetic",
  Calm = "Calm",
  Angry = "Angry",
  Melancholic = "Melancholic",
  Excited = "Excited",
  Relaxed = "Relaxed",
  Nostalgic = "Nostalgic",
  Motivated = "Motivated",
}

export enum Purpose {
  Workout = "Workout",
  Study = "Study",
  Party = "Party",
  Sleep = "Sleep",
  Meditation = "Meditation",
  Travel = "Travel",
  Cooking = "Cooking",
  Cleaning = "Cleaning",
  Social = "Social",
  Personal = "Personal",
}
