export interface User {
  id: string;
  email: string;
  username: string;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: ApiUser;
  token: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  duration: string;
  rating?: number;
  isLiked: boolean;
  youtubeId?: string;
  thumbnail?: string;
  purpose?: string;
  emotionalState?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  userId: string;
}

export interface FilterOptions {
  genre?: string;
  emotionalState?: string;
  numberOfSongs?: number;
  purpose?: string;
}

export enum EmotionalState {
  Unknown = "Unknown",
  Happy = "Happy",
  Sad = "Sad",
  Energetic = "Energetic",
  Calm = "Calm",
  Motivated = "Motivated",
}

export enum Purpose {
  Unknown = "Unknown",
  Study = "Study",
  Workout = "Workout",
  Chill = "Chill",
  Party = "Party",
  Focus = "Focus",
}

export enum Genre {
  Unknown = "Unknown",
  Pop = "Pop",
  Rock = "Rock",
  Classical = "Classical",
  HipHop = "Hip Hop",
  Jazz = "Jazz",
  Electronic = "Electronic",
  RnB = "R&B",
}
