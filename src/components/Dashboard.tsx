import React, { useState, useEffect } from "react";
import {
  User,
  FilterOptions,
  Song,
  Genre,
  EmotionalState,
  Purpose,
} from "../types";
import { mockSongs } from "../data/mockSongs";

interface DashboardProps {
  user: User;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const Dashboard = ({ user }: DashboardProps) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [songs, setSongs] = useState<Song[]>(mockSongs);
  const [showFilters, setShowFilters] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);

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
          autoplay: 0,
          controls: 0,
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setCurrentlyPlaying(null);
            }
          },
        },
      });
      setPlayer(newPlayer);
    };

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, []);

  const handleFilterChange = (
    key: keyof FilterOptions,
    value: string | number
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({});
    setSongs(mockSongs);
  };

  const handleGeneratePlaylist = () => {
    let filteredSongs = [...mockSongs];

    if (filters.genre) {
      filteredSongs = filteredSongs.filter(
        (song) => song.genre === filters.genre
      );
    }

    if (filters.numberOfSongs) {
      filteredSongs = filteredSongs.slice(0, filters.numberOfSongs);
    }

    setSongs(filteredSongs);
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
      player?.pauseVideo();
      setCurrentlyPlaying(null);
    } else {
      // If a different song is clicked, play it
      player?.loadVideoById(song.youtubeId);
      setCurrentlyPlaying(song.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div id="youtube-player" className="hidden"></div>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user.username}!
            </h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {showFilters && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Genre
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                  <label className="block text-sm font-medium text-gray-700">
                    Emotional State
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Songs
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                  <label className="block text-sm font-medium text-gray-700">
                    Purpose
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                  className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Generate Playlist
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {songs.map((song) => (
                <li key={song.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {song.title}
                      </p>
                      <p className="text-sm text-gray-500">{song.artist}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handlePlay(song)}
                        className={`p-2 rounded-full ${
                          currentlyPlaying === song.id
                            ? "bg-indigo-100 text-indigo-600"
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
                        <label className="mr-2 text-sm text-gray-600">
                          Rating:
                        </label>
                        <select
                          className="block w-20 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                        className={`text-2xl ${
                          song.isLiked ? "text-red-500" : "text-gray-400"
                        }`}
                      >
                        ❤️
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
