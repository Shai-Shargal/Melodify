import axios from "axios";
import { Song, Playlist } from "../types";

const API_BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User related API calls
export const userApi = {
  register: async (userData: {
    email: string;
    name: string;
    password: string;
  }) => {
    const response = await api.post("/users/register", userData);
    return response.data;
  },
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post("/users/login", credentials);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
  },
};

// Song related API calls
export const songApi = {
  getAll: async () => {
    const response = await api.get("/songs");
    return response.data as Song[];
  },
  create: async (songData: {
    title: string;
    artist: string;
    youtubeId: string;
    thumbnail: string;
    duration: string;
    genre: string;
    userId: string;
  }) => {
    const response = await api.post("/songs", songData);
    return response.data as Song;
  },
};

// Playlist related API calls
export const playlistApi = {
  getAll: async () => {
    const response = await api.get("/playlists");
    return response.data as Playlist[];
  },
  getById: async (id: string) => {
    const response = await api.get(`/playlists/${id}`);
    return response.data as Playlist;
  },
  create: async (playlistData: {
    name: string;
    description: string;
    userId: string;
    songs: string[];
  }) => {
    const response = await api.post("/playlists", playlistData);
    return response.data as Playlist;
  },
  update: async (
    id: string,
    playlistData: { name: string; description?: string }
  ) => {
    const response = await api.put(`/playlists/${id}`, playlistData);
    return response.data as Playlist;
  },
  addSong: async (playlistId: string, songId: string) => {
    const response = await api.post(`/playlists/${playlistId}/songs`, {
      songId,
    });
    return response.data as Playlist;
  },
  removeSong: async (playlistId: string, songId: string) => {
    const response = await api.delete(
      `/playlists/${playlistId}/songs/${songId}`
    );
    return response.data as Playlist;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/playlists/${id}`);
    return response.data;
  },
};

export default api;
