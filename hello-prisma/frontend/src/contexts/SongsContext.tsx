import React, { createContext, useContext, useState } from "react";

export interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  createdAt: string;
  rating?: number;
  purpose?: string;
  emotionalState?: string;
  isLiked?: boolean;
  genre?: string;
}

interface SongsContextType {
  songs: Song[];
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
}

const SongsContext = createContext<SongsContextType | undefined>(undefined);

export const SongsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [songs, setSongs] = useState<Song[]>([]);
  return (
    <SongsContext.Provider value={{ songs, setSongs }}>
      {children}
    </SongsContext.Provider>
  );
};

export const useSongs = () => {
  const context = useContext(SongsContext);
  if (!context) throw new Error("useSongs must be used within a SongsProvider");
  return context;
};
