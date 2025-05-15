import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  FilterOptions,
  Song,
  Genre,
  EmotionalState,
  Purpose,
  Playlist,
} from "../types";
import { playlistApi, songApi } from "../services/api";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [songs, setSongs] = useState<Song[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const data = await songApi.getAll();
        setSongs(data);
      } catch (error) {
        console.error("Failed to fetch songs:", error);
      }
    };
    fetchSongs();
  }, []);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player("youtube-player", {
        height: "0",
        width: "0",
        videoId: "",
        playerVars: {
          autoplay: 1,
          controls: 0,
          origin: window.location.origin,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          fs: 0,
          iv_load_policy: 3,
          showinfo: 0,
          disablekb: 1,
          cc_load_policy: 0,
          host: "https://www.youtube-nocookie.com",
          privacy: 1,
          noCookie: true,
          preventFullScreen: true,
          widget_referrer: window.location.origin,
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setCurrentlyPlaying(null);
            }
          },
          onError: (event: any) => {
            console.error("YouTube Player Error:", event.data);
            setCurrentlyPlaying(null);
            setError("Failed to play video. Please try again.");
          },
          onReady: (event: any) => {
            console.log("YouTube Player Ready");
            setPlayer(event.target);
          },
        },
      });
    };

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = (await playlistApi.getAll()) as Playlist[];
        setPlaylists(data);
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      }
    };
    fetchPlaylists();
  }, []);

  const handleFilterChange = (
    key: keyof FilterOptions,
    value: string | number
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = async () => {
    setFilters({});
    try {
      const data = await songApi.getAll();
      setSongs(data);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    }
  };

  const handleGeneratePlaylist = async () => {
    try {
      let filteredSongs = await songApi.getAll();

      if (filters.genre) {
        filteredSongs = filteredSongs.filter(
          (song) => song.genre === filters.genre
        );
      }

      if (filters.numberOfSongs) {
        filteredSongs = filteredSongs.slice(0, filters.numberOfSongs);
      }

      setSongs(filteredSongs);
    } catch (error) {
      console.error("Failed to generate playlist:", error);
    }
  };

  const handleLike = (songId: string) => {
    setSongs((prev) =>
      prev.map((song) =>
        song.id === songId ? { ...song, isLiked: !song.isLiked } : song
      )
    );
  };

  const handleRating = (songId: string, rating: number) => {
    setSongs((prev) =>
      prev.map((song) => (song.id === songId ? { ...song, rating } : song))
    );
  };

  const handlePlay = (song: Song) => {
    if (!song.youtubeId) return;

    if (currentlyPlaying === song.id) {
      // If the same song is clicked, stop it
      try {
        player?.pauseVideo();
        setCurrentlyPlaying(null);
      } catch (error) {
        console.error("Error pausing video:", error);
      }
    } else {
      // If a different song is clicked, play it
      try {
        player?.loadVideoById({
          videoId: song.youtubeId,
          startSeconds: 0,
        });
        player?.playVideo();
        setCurrentlyPlaying(song.id);
      } catch (error) {
        console.error("Error playing video:", error);
        setCurrentlyPlaying(null);
        setError("Failed to play video. Please try again.");
      }
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleAddSong = async () => {
    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const videoId = extractYouTubeId(youtubeUrl);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      // Fetch video details using YouTube oEmbed API
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch video details");
      }

      const videoData = await response.json();

      // Create new song in the database
      const newSong: Song = await songApi.create({
        title: videoData.title,
        artist: videoData.author_name,
        youtubeId: videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        duration: "0:00", // We'll need to fetch this from YouTube API
        genre: "Custom",
        userId: user.id,
      });

      setSongs((prevSongs) => [...prevSongs, newSong]);
      setShowAddSongModal(false);
      setYoutubeUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add song");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      const newPlaylist = (await playlistApi.create({
        name: newPlaylistName,
        description: "",
        userId: user.id,
        songs: [],
      })) as Playlist;
      setPlaylists([...playlists, newPlaylist]);
      setShowCreatePlaylistModal(false);
      setNewPlaylistName("");
    } catch (error) {
      console.error("Failed to create playlist:", error);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!selectedSong) return;

    try {
      console.log("Adding song to playlist:", {
        playlistId,
        songId: selectedSong.id,
      });

      await playlistApi.addSong(playlistId, selectedSong.id);
      setShowAddToPlaylistModal(false);
      setSelectedSong(null);

      // Refresh playlists after adding song
      const updatedPlaylists = (await playlistApi.getAll()) as Playlist[];
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error("Failed to add song to playlist:", error);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-indigo-100 to-purple-100"
      }`}
    >
      <nav
        className={`${
          isDarkMode ? "bg-gray-800" : "bg-white/80 backdrop-blur-sm"
        } shadow-sm`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Welcome, {user.username}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDarkMode
                    ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                }`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={onLogout}
                className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                  isDarkMode
                    ? "bg-red-700 hover:bg-red-800 focus:ring-red-500"
                    : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main
        className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ${
          isDarkMode ? "bg-gray-900" : "bg-transparent"
        }`}
      >
        <div className="min-h-screen">
          <div id="youtube-player" className="hidden"></div>

          {/* Header Section */}
          <header
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white/80 backdrop-blur-sm"
            } shadow-md border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Top Bar */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-white border-4 border-black">
                    <img
                      src="/Assets/music-svgrepo-com.svg"
                      alt="Melodify Logo"
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <h1
                      className={`text-2xl font-bold tracking-tight ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Melodify
                    </h1>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Your Personal Music Companion
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowAddSongModal(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isDarkMode
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Add Song</span>
                  </button>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isDarkMode
                        ? "bg-indigo-500 text-white hover:bg-indigo-600"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
                  </button>
                </div>
              </div>

              {/* Bottom Bar */}
              <div
                className={`py-3 flex items-center justify-between border-t ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-6">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDarkMode
                        ? "bg-indigo-900/50 text-indigo-200"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {songs.length} Songs
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Add Song Modal */}
            {showAddSongModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div
                  className={`${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  } rounded-xl shadow-xl p-6 w-full max-w-md`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className={`text-lg font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Add Song from YouTube
                    </h3>
                    <button
                      onClick={() => setShowAddSongModal(false)}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        isDarkMode
                          ? "text-gray-400 hover:text-white hover:bg-gray-700"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        YouTube URL
                      </label>
                      <input
                        type="text"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? "bg-gray-700 text-white border-gray-600 focus:border-green-500"
                            : "bg-white border-gray-300 focus:border-green-500"
                        } focus:ring-2 focus:ring-green-200 transition-colors duration-200`}
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowAddSongModal(false)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          isDarkMode
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddSong}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                          isDarkMode
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-green-600 text-white hover:bg-green-700"
                        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            <span>Add Song</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters Section */}
            {showFilters && (
              <div
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-xl shadow-lg p-6 mb-8 transition-all duration-200`}
              >
                <h2
                  className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Filter Your Music
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Genre
                    </label>
                    <select
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600 focus:border-indigo-500"
                          : "bg-white border-gray-300 focus:border-indigo-500"
                      } focus:ring-2 focus:ring-indigo-200 transition-colors duration-200`}
                      value={filters.genre || ""}
                      onChange={(e) =>
                        handleFilterChange("genre", e.target.value)
                      }
                    >
                      <option value="">All Genres</option>
                      {Object.values(Genre).map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Emotional State
                    </label>
                    <select
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600 focus:border-indigo-500"
                          : "bg-white border-gray-300 focus:border-indigo-500"
                      } focus:ring-2 focus:ring-indigo-200 transition-colors duration-200`}
                      value={filters.emotionalState || ""}
                      onChange={(e) =>
                        handleFilterChange("emotionalState", e.target.value)
                      }
                    >
                      <option value="">Any Mood</option>
                      {Object.values(EmotionalState).map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Number of Songs
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600 focus:border-indigo-500"
                          : "bg-white border-gray-300 focus:border-indigo-500"
                      } focus:ring-2 focus:ring-indigo-200 transition-colors duration-200`}
                      value={filters.numberOfSongs || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "numberOfSongs",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Purpose
                    </label>
                    <select
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600 focus:border-indigo-500"
                          : "bg-white border-gray-300 focus:border-indigo-500"
                      } focus:ring-2 focus:ring-indigo-200 transition-colors duration-200`}
                      value={filters.purpose || ""}
                      onChange={(e) =>
                        handleFilterChange("purpose", e.target.value)
                      }
                    >
                      <option value="">Any Purpose</option>
                      {Object.values(Purpose).map((purpose) => (
                        <option key={purpose} value={purpose}>
                          {purpose}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={handleGeneratePlaylist}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isDarkMode
                        ? "bg-indigo-500 text-white hover:bg-indigo-600"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    Generate Playlist
                  </button>
                  <button
                    onClick={handleReset}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}

            {/* Add Playlists Section */}
            <div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white/80 backdrop-blur-sm"
              } rounded-xl shadow-lg p-6 mb-8`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Your Playlists
                </h2>
                <button
                  onClick={() => setShowCreatePlaylistModal(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isDarkMode
                      ? "bg-indigo-500 text-white hover:bg-indigo-600"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Create Playlist</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className={`p-4 rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-white"
                    } shadow`}
                  >
                    <h3
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {playlist.name}
                    </h3>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {playlist.songs.length} songs
                    </p>
                    <button
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                      className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      View Playlist
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Songs List */}
            <div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white/80 backdrop-blur-sm"
              } rounded-xl shadow-lg overflow-hidden`}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Your Music Collection
                </h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {songs.map((song) => (
                  <li
                    key={song.id}
                    className={`px-6 py-4 transition-colors duration-200 ${
                      isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          } truncate`}
                        >
                          {song.title}
                        </p>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {song.artist}
                        </p>
                      </div>
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handlePlay(song)}
                          className={`p-2 rounded-full transition-colors duration-200 ${
                            currentlyPlaying === song.id
                              ? isDarkMode
                                ? "bg-indigo-900 text-indigo-300"
                                : "bg-indigo-100 text-indigo-600"
                              : isDarkMode
                              ? "text-gray-400 hover:text-indigo-400"
                              : "text-gray-400 hover:text-indigo-600"
                          }`}
                          disabled={!song.youtubeId}
                        >
                          {currentlyPlaying === song.id ? (
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          )}
                        </button>
                        <div className="flex items-center">
                          <label
                            className={`mr-2 text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Rating:
                          </label>
                          <select
                            className={`w-20 px-2 py-1 rounded-lg border ${
                              isDarkMode
                                ? "bg-gray-700 text-white border-gray-600 focus:border-indigo-500"
                                : "bg-white border-gray-300 focus:border-indigo-500"
                            } focus:ring-2 focus:ring-indigo-200 transition-colors duration-200`}
                            value={song.rating || ""}
                            onChange={(e) =>
                              handleRating(song.id, parseInt(e.target.value))
                            }
                          >
                            <option value="">Rate</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => handleLike(song.id)}
                          className={`text-2xl transition-transform duration-200 hover:scale-110 ${
                            song.isLiked
                              ? "text-red-500"
                              : isDarkMode
                              ? "text-gray-400"
                              : "text-gray-400"
                          }`}
                        >
                          ❤️
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSong(song);
                            setShowAddToPlaylistModal(true);
                          }}
                          className={`text-sm font-medium ${
                            isDarkMode
                              ? "text-indigo-400 hover:text-indigo-300"
                              : "text-indigo-600 hover:text-indigo-500"
                          }`}
                        >
                          Add to Playlist
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </main>
        </div>
      </main>

      {/* Create Playlist Modal */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } rounded-xl shadow-xl p-6 w-full max-w-md`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Create New Playlist
            </h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Enter playlist name"
              className={`w-full p-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreatePlaylistModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Playlist Modal */}
      {showAddToPlaylistModal && selectedSong && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } rounded-xl shadow-xl p-6 w-full max-w-md`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Add to Playlist
            </h3>
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className={`w-full p-2 text-left rounded-lg ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-white"
                      : "hover:bg-gray-50 text-gray-900"
                  }`}
                >
                  {playlist.name}
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAddToPlaylistModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
