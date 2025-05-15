import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Playlist, Song } from "../types";
import { playlistApi } from "../services/api";

interface PlaylistViewProps {
  user: User;
  onLogout: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const PlaylistView = ({ user, onLogout }: PlaylistViewProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [playlistName, setPlaylistName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const initializePlayer = useCallback(() => {
    if (window.YT && window.YT.Player) {
      console.log("Initializing YouTube player...");
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
            console.log("Player state changed:", event.data);
            if (event.data === window.YT.PlayerState.ENDED) {
              handleNext();
            }
          },
          onError: (event: any) => {
            console.error("YouTube Player Error:", event.data);
            setCurrentlyPlaying(null);
            setError("Failed to play video. Please try again.");
          },
          onReady: (event: any) => {
            console.log("YouTube Player Ready");
            const player = event.target;
            player.setVolume(100);
            setPlayer(player);
            setIsPlayerReady(true);
          },
        },
      });
    } else {
      console.error("YouTube API not loaded");
    }
  }, []);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [initializePlayer]);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setIsLoading(true);
        const data = await playlistApi.getById(id || "");
        setPlaylist(data);
        setPlaylistName(data.name);
      } catch (error) {
        console.error("Failed to fetch playlist:", error);
        setError("Failed to load playlist");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPlaylist();
    }
  }, [id]);

  const handleSavePlaylist = async () => {
    if (!playlist) return;

    try {
      const updatedPlaylist = await playlistApi.update(playlist.id, {
        name: playlistName,
        description: playlist.description || "",
      });
      setPlaylist(updatedPlaylist);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update playlist:", error);
      setError("Failed to update playlist name");
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;

    if (window.confirm("Are you sure you want to delete this playlist?")) {
      try {
        await playlistApi.delete(playlist.id);
        navigate("/dashboard");
      } catch (error) {
        console.error("Failed to delete playlist:", error);
        setError("Failed to delete playlist");
      }
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist) return;

    try {
      await playlistApi.removeSong(playlist.id, songId);
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              songs: prev.songs.filter((song) => song.id !== songId),
            }
          : null
      );
    } catch (error) {
      console.error("Failed to remove song:", error);
      setError("Failed to remove song from playlist");
    }
  };

  const handlePlay = useCallback(
    (song: Song, index: number) => {
      console.log("Attempting to play song:", song);
      console.log("Player ready:", isPlayerReady);
      console.log("Current player state:", player?.getPlayerState?.());

      if (!song.youtubeId) {
        console.error("No YouTube ID for song:", song);
        return;
      }

      if (!isPlayerReady) {
        console.error("Player not ready");
        return;
      }

      if (currentlyPlaying === song.id) {
        // If the same song is clicked, stop it
        try {
          console.log("Pausing current song");
          player?.pauseVideo();
          setCurrentlyPlaying(null);
        } catch (error) {
          console.error("Error pausing video:", error);
        }
      } else {
        // If a different song is clicked, play it
        try {
          console.log("Loading and playing new song:", song.youtubeId);
          player?.loadVideoById({
            videoId: song.youtubeId,
            startSeconds: 0,
          });
          player?.setVolume(100);
          player?.playVideo();
          setCurrentlyPlaying(song.id);
          setCurrentSongIndex(index);
        } catch (error) {
          console.error("Error playing video:", error);
          setCurrentlyPlaying(null);
          setError("Failed to play video. Please try again.");
        }
      }
    },
    [currentlyPlaying, isPlayerReady, player]
  );

  const handleNext = useCallback(() => {
    if (!playlist || currentSongIndex === -1) return;

    const nextIndex = (currentSongIndex + 1) % playlist.songs.length;
    const nextSong = playlist.songs[nextIndex];
    handlePlay(nextSong, nextIndex);
  }, [playlist, currentSongIndex, handlePlay]);

  const handlePrevious = useCallback(() => {
    if (!playlist || currentSongIndex === -1) return;

    const prevIndex =
      (currentSongIndex - 1 + playlist.songs.length) % playlist.songs.length;
    const prevSong = playlist.songs[prevIndex];
    handlePlay(prevSong, prevIndex);
  }, [playlist, currentSongIndex, handlePlay]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!playlist) {
    return <div>Playlist not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Playlist View</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDeletePlaylist}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Playlist
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              {isEditing ? (
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="text-3xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">
                  {playlist.name}
                </h1>
              )}
              <button
                onClick={() =>
                  isEditing ? handleSavePlaylist() : setIsEditing(true)
                }
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                {isEditing ? "Save" : "Edit"}
              </button>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-500"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Music Player Controls */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={handlePrevious}
                className="p-2 rounded-full hover:bg-gray-100"
                disabled={!playlist.songs.length}
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (currentSongIndex !== -1) {
                    handlePlay(
                      playlist.songs[currentSongIndex],
                      currentSongIndex
                    );
                  }
                }}
                className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={!playlist.songs.length}
              >
                {currentlyPlaying ? (
                  <svg
                    className="w-8 h-8"
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
                    className="w-8 h-8"
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
              <button
                onClick={handleNext}
                className="p-2 rounded-full hover:bg-gray-100"
                disabled={!playlist.songs.length}
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            {currentlyPlaying && currentSongIndex !== -1 && (
              <div className="mt-4 text-center">
                <p className="text-lg font-medium text-gray-900">
                  {playlist.songs[currentSongIndex].title}
                </p>
                <p className="text-sm text-gray-500">
                  {playlist.songs[currentSongIndex].artist}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {playlist.songs.map((song, index) => (
                <li
                  key={song.id}
                  className={`px-6 py-4 ${
                    currentlyPlaying === song.id ? "bg-indigo-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {song.title}
                      </p>
                      <p className="text-sm text-gray-500">{song.artist}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handlePlay(song, index)}
                        className={`p-2 rounded-full transition-colors duration-200 ${
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
                      <button
                        onClick={() => handleRemoveSong(song.id)}
                        className="text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {playlist.songs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No songs in this playlist yet.</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Songs
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Add debug information */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-0 right-0 bg-black bg-opacity-75 text-white p-4 m-4 rounded-lg text-sm">
          <p>Player Ready: {isPlayerReady ? "Yes" : "No"}</p>
          <p>Currently Playing: {currentlyPlaying || "None"}</p>
          <p>Current Index: {currentSongIndex}</p>
          {error && <p className="text-red-400">Error: {error}</p>}
        </div>
      )}

      <div id="youtube-player" className="hidden"></div>
    </div>
  );
};

export default PlaylistView;
