import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Playlist, Song } from "../types";
import { mockSongs } from "../data/mockSongs";

interface PlaylistViewProps {
  user: User;
}

const PlaylistView = ({ user }: PlaylistViewProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [playlistName, setPlaylistName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // For demo purposes, create a mock playlist
    if (id === "new") {
      setPlaylist({
        id: "new",
        name: "New Playlist",
        songs: [],
        userId: user.id,
      });
      setPlaylistName("New Playlist");
      setIsEditing(true);
    } else {
      // In a real app, fetch the playlist from an API
      setPlaylist({
        id: id || "1",
        name: "My Playlist",
        songs: mockSongs.slice(0, 5),
        userId: user.id,
      });
      setPlaylistName("My Playlist");
    }
  }, [id, user.id]);

  const handleSavePlaylist = () => {
    if (!playlist) return;

    setPlaylist((prev) =>
      prev
        ? {
            ...prev,
            name: playlistName,
          }
        : null
    );
    setIsEditing(false);
  };

  const handleRemoveSong = (songId: string) => {
    if (!playlist) return;

    setPlaylist((prev) =>
      prev
        ? {
            ...prev,
            songs: prev.songs.filter((song) => song.id !== songId),
          }
        : null
    );
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

  if (!playlist) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
      </div>
    </div>
  );
};

export default PlaylistView;
