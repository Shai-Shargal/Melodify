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
  console.log("Request interceptor - Token:", token);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Request headers:", config.headers);
  }
  return config;
});

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

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
  update: async (id: string, songData: Partial<Song>) => {
    const response = await api.put(`/songs/${id}`, songData);
    return response.data as Song;
  },
};

// Playlist related API calls
export const playlistApi = {
  playlists: {
    getAll: async () => {
      const response = await api.get("/playlists");
      return response.data;
    },
    getById: async (id: string) => {
      const response = await api.get(`/playlists/${id}`);
      return response.data;
    },
    create: async (data: { name: string; songs?: string[] }) => {
      const response = await api.post("/playlists", data);
      return response.data;
    },
    update: async (
      id: string,
      data: { name: string; description?: string; songs?: string[] }
    ) => {
      const response = await api.put(`/playlists/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await api.delete(`/playlists/${id}`);
      return response.data;
    },
    addSong: async (playlistId: string, songId: string) => {
      const response = await api.post(`/playlists/${playlistId}/songs`, {
        songId,
      });
      return response.data;
    },
    removeSong: async (playlistId: string, songId: string) => {
      const response = await api.delete(
        `/playlists/${playlistId}/songs/${songId}`
      );
      return response.data;
    },
  },
};

export default api;
