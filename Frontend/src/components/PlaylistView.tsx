import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Playlist, Song } from "../types";
import { playlistApi } from "../services/api";

interface PlaylistViewProps {
  user: User;
  onLogout: () => void;
}

const PlaylistView = ({ user, onLogout }: PlaylistViewProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [playlistName, setPlaylistName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleAddSong = (song: Song) => {
    if (!playlist) return;

    setPlaylist((prev) =>
      prev
        ? {
            ...prev,
            songs: [...prev.songs, song],
          }
        : null
    );
  };

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

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {playlist.songs.map((song) => (
                <li key={song.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {song.title}
                      </p>
                      <p className="text-sm text-gray-500">{song.artist}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveSong(song.id)}
                      className="ml-4 text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
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
    </div>
  );
};

export default PlaylistView;
