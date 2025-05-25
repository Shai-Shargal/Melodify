import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Playlist, PlaylistSong } from "../types";
import { playlistApi } from "../services/api";
import { Trash2 } from "lucide-react";

interface PlaylistViewProps {
  user: User | null;
  onLogout: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const PlaylistView: React.FC<PlaylistViewProps> = ({ user, onLogout }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const initializePlayer = useCallback(() => {
    console.log("Initializing YouTube player...");
    if (!window.YT) {
      console.error("YouTube API not loaded");
      return;
    }

    try {
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
    } catch (error) {
      console.error("Error initializing player:", error);
      setError("Failed to initialize player");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadYouTubeAPI = () => {
      if (window.YT) {
        console.log("YouTube API already loaded");
        initializePlayer();
        return;
      }

      console.log("Loading YouTube API...");
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube API Ready callback");
        if (isMounted) {
          initializePlayer();
        }
      };
    };

    loadYouTubeAPI();

    return () => {
      isMounted = false;
      if (player) {
        console.log("Destroying player");
        player.destroy();
      }
    };
  }, [initializePlayer]);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const data = (await playlistApi.playlists.getById(id!)) as Playlist;
        setPlaylist(data);
        setEditedName(data.name);
      } catch (error) {
        console.error("Error fetching playlist:", error);
        setError("Failed to load playlist");
      }
    };

    if (id) {
      fetchPlaylist();
    }
  }, [id]);

  const handleSave = async () => {
    if (!playlist) return;

    try {
      const updatedPlaylist = (await playlistApi.playlists.update(playlist.id, {
        name: editedName,
      })) as Playlist;
      setPlaylist(updatedPlaylist);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating playlist:", error);
      setError("Failed to update playlist");
    }
  };

  const handleDelete = async () => {
    if (!playlist) return;

    if (window.confirm("Are you sure you want to delete this playlist?")) {
      try {
        await playlistApi.playlists.delete(playlist.id);
        navigate("/dashboard");
      } catch (error) {
        console.error("Error deleting playlist:", error);
        setError("Failed to delete playlist");
      }
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist) return;

    try {
      const updatedPlaylist = (await playlistApi.playlists.removeSong(
        playlist.id,
        songId
      )) as Playlist;
      setPlaylist(updatedPlaylist);
    } catch (error) {
      console.error("Error removing song:", error);
      setError("Failed to remove song from playlist");
    }
  };

  const handlePlay = useCallback(
    (song: PlaylistSong, index: number) => {
      console.log("Attempting to play song:", song);
      console.log("Player ready:", isPlayerReady);
      console.log("Current player state:", player?.getPlayerState?.());

      if (!song.song.youtubeId) {
        console.error("No YouTube ID for song:", song);
        return;
      }

      if (!isPlayerReady || !player) {
        console.error("Player not ready, initializing...");
        initializePlayer();
        return;
      }

      if (currentlyPlaying === song.song.id) {
        // If the same song is clicked, stop it
        try {
          console.log("Pausing current song");
          player.pauseVideo();
          setCurrentlyPlaying(null);
        } catch (error) {
          console.error("Error pausing video:", error);
        }
      } else {
        // If a different song is clicked, play it
        try {
          console.log("Loading and playing new song:", song.song.youtubeId);
          player.loadVideoById({
            videoId: song.song.youtubeId,
            startSeconds: 0,
          });
          player.setVolume(100);
          player.playVideo();
          setCurrentlyPlaying(song.song.id);
          setCurrentSongIndex(index);
        } catch (error) {
          console.error("Error playing video:", error);
          setCurrentlyPlaying(null);
          setError("Failed to play video. Please try again.");
        }
      }
    },
    [currentlyPlaying, isPlayerReady, player, initializePlayer]
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

  if (!playlist) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          {isEditing ? (
            <div className="flex-1 mr-4">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Playlist name"
              />
            </div>
          ) : (
            <h1 className="text-3xl font-bold">{playlist.name}</h1>
          )}
          <div className="flex space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedName(playlist.name);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="space-y-4">
            {playlist.songs.map((playlistSong) => (
              <div
                key={playlistSong.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={playlistSong.song.thumbnail}
                    alt={playlistSong.song.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{playlistSong.song.title}</h3>
                    <p className="text-gray-600">{playlistSong.song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRemoveSong(playlistSong.song.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistView;
