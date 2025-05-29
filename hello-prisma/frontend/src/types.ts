export interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnail?: string;
  rating?: number;
  purpose?: string;
  emotionalState?: string;
  isLiked?: boolean;
  genre?: string;
  createdAt: string;
  updatedAt: string;
}
