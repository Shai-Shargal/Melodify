import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Slider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useSongs } from "../contexts/SongsContext";
import { usePlayer } from "../contexts/PlayerContext";

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

const genreOptions = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "Jazz",
  "Classical",
  "Electronic",
  "Other",
];
const purposeOptions = [
  "Workout",
  "Relax",
  "Study",
  "Party",
  "Commute",
  "Other",
];
const emotionalStateOptions = [
  "Happy",
  "Sad",
  "Energetic",
  "Calm",
  "Romantic",
  "Other",
];

const Playlists: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { songs } = useSongs();
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [filter, setFilter] = useState({
    purpose: "",
    emotionalState: "",
    genre: "",
  });
  const [addLoading, setAddLoading] = useState<string | null>(null);
  const { setCurrentSong, setIsPlaying } = usePlayer();
  const [playlistSongsDialogOpen, setPlaylistSongsDialogOpen] = useState(false);
  const [playlistSongs, setPlaylistSongs] = useState<any[]>([]);
  const [playlistSongsLoading, setPlaylistSongsLoading] = useState(false);
  const [playlistSongsError, setPlaylistSongsError] = useState("");
  const [playlistPlayerIndex, setPlaylistPlayerIndex] = useState<number>(0);
  const [playlistPlayerPlaying, setPlaylistPlayerPlaying] = useState(false);
  const [playlistPlayerProgress, setPlaylistPlayerProgress] = useState(0);
  const [playlistPlayerDuration, setPlaylistPlayerDuration] = useState(0);
  const playlistPlayerInterval = useRef<any>(null);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:3000/playlists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPlaylists(response.data);
    } catch (err) {
      console.error("Error fetching playlists:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylists();
    }
  }, [isAuthenticated]);

  const handleOpen = () => {
    if (!isAuthenticated) {
      setError("Please log in to create a playlist");
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setDescription("");
    setError("");
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to create a playlist");
        return;
      }

      await axios.post(
        "http://localhost:3000/playlists",
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      handleClose();
      fetchPlaylists(); // Refresh the playlist list
    } catch (err) {
      setError("Failed to create playlist. Please try again.");
      console.error("Create playlist error:", err);
    }
  };

  const openAddDialog = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setAddDialogOpen(true);
    setFilter({ purpose: "", emotionalState: "", genre: "" });
  };

  const closeAddDialog = () => {
    setAddDialogOpen(false);
    setSelectedPlaylist(null);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilter((prev) => ({ ...prev, [field]: value }));
  };

  const filteredSongs = songs.filter((song) => {
    return (
      (!filter.purpose || song.purpose === filter.purpose) &&
      (!filter.emotionalState ||
        song.emotionalState === filter.emotionalState) &&
      (!filter.genre || song.genre === filter.genre)
    );
  });

  const handleAddSongToPlaylist = async (songId: string) => {
    if (!selectedPlaylist) return;
    setAddLoading(songId);
    try {
      await axios.post(
        `http://localhost:3000/playlists/${selectedPlaylist.id}/songs`,
        { songId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optionally: show a success message or update playlist songs
    } catch (err) {
      alert("Failed to add song to playlist");
    } finally {
      setAddLoading(null);
    }
  };

  const openPlaylistSongsDialog = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setPlaylistSongsDialogOpen(true);
    setPlaylistSongsLoading(true);
    setPlaylistSongsError("");
    try {
      const res = await axios.get(
        `http://localhost:3000/playlists/${playlist.id}/songs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlaylistSongs(res.data);
    } catch (err) {
      setPlaylistSongsError("Failed to load songs for this playlist.");
      setPlaylistSongs([]);
    } finally {
      setPlaylistSongsLoading(false);
    }
  };

  const closePlaylistSongsDialog = () => {
    setPlaylistSongsDialogOpen(false);
    setPlaylistSongs([]);
  };

  const handlePlaylistPlaySong = (index: number) => {
    if (!playlistSongs[index]) return;
    setPlaylistPlayerIndex(index);
    setCurrentSong(playlistSongs[index]);
    setIsPlaying(true);
    setPlaylistPlayerPlaying(true);
    setPlaylistPlayerProgress(0);
  };

  const handlePlaylistPlayPause = () => {
    setPlaylistPlayerPlaying((prev) => {
      setIsPlaying(!prev);
      return !prev;
    });
  };

  const handlePlaylistNext = () => {
    if (playlistSongs.length === 0) return;
    const nextIndex = (playlistPlayerIndex + 1) % playlistSongs.length;
    handlePlaylistPlaySong(nextIndex);
  };

  const handlePlaylistPrev = () => {
    if (playlistSongs.length === 0) return;
    const prevIndex =
      (playlistPlayerIndex - 1 + playlistSongs.length) % playlistSongs.length;
    handlePlaylistPlaySong(prevIndex);
  };

  useEffect(() => {
    if (playlistSongsDialogOpen && playlistPlayerPlaying) {
      playlistPlayerInterval.current = setInterval(() => {
        const audio = document.getElementById("youtube-player") as any;
        if (window.YT && window.YT.get && window.YT.get("player")) {
          // Not used, but placeholder for future YouTube API sync
        }
        // We rely on the global player context for now
      }, 500);
      return () => clearInterval(playlistPlayerInterval.current);
    } else {
      if (playlistPlayerInterval.current)
        clearInterval(playlistPlayerInterval.current);
    }
  }, [playlistSongsDialogOpen, playlistPlayerPlaying]);

  useEffect(() => {
    setPlaylistPlayerIndex(0);
  }, [playlistSongsDialogOpen, playlistSongs.length]);

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!token) {
      alert("Please log in to delete playlists");
      return;
    }

    try {
      console.log("Attempting to delete playlist:", playlistId);
      const response = await axios.delete(
        `http://localhost:3000/playlists/${playlistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Delete response:", response.data);
      setPlaylists(playlists.filter((p) => p.id !== playlistId));
    } catch (error) {
      console.error("Error deleting playlist:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        console.error("Error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        alert(`Failed to delete playlist: ${errorMessage}`);
      } else {
        alert("Failed to delete playlist. Please try again.");
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            My Playlists
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            Create Playlist
          </Button>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              onClick={() => openPlaylistSongsDialog(playlist)}
              style={{ cursor: "pointer" }}
            >
              <CardContent>
                <Typography variant="h6" component="h2">
                  {playlist.name}
                </Typography>
                {playlist.description && (
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {playlist.description}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Created: {new Date(playlist.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    openAddDialog(playlist);
                  }}
                >
                  <AddIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePlaylist(playlist.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Create New Playlist</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Playlist Name"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!error}
              helperText={error}
            />
            <TextField
              margin="dense"
              label="Description (optional)"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleCreate} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={addDialogOpen}
          onClose={closeAddDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Songs to Playlist</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                select
                label="Purpose"
                value={filter.purpose}
                onChange={(e) => handleFilterChange("purpose", e.target.value)}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                {purposeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </TextField>
              <TextField
                select
                label="Emotional State"
                value={filter.emotionalState}
                onChange={(e) =>
                  handleFilterChange("emotionalState", e.target.value)
                }
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                {emotionalStateOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </TextField>
              <TextField
                select
                label="Genre"
                value={filter.genre}
                onChange={(e) => handleFilterChange("genre", e.target.value)}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                {genreOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </TextField>
            </Box>
            <Box>
              {filteredSongs.length === 0 ? (
                <Typography>No songs match the selected filters.</Typography>
              ) : (
                filteredSongs.map((song) => (
                  <Box
                    key={song.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      background: "#222",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography>{song.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {song.artist}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mt: 0.5,
                        }}
                      >
                        {/* Genre */}
                        {song.genre && (
                          <Typography
                            variant="caption"
                            color="primary"
                            sx={{ fontWeight: 500 }}
                          >
                            {song.genre}
                          </Typography>
                        )}
                        {/* Purpose */}
                        {song.purpose && (
                          <Typography
                            variant="caption"
                            color="secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            {song.purpose}
                          </Typography>
                        )}
                        {/* Emotional State */}
                        {song.emotionalState && (
                          <Typography variant="caption" color="text.secondary">
                            {song.emotionalState}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSongToPlaylist(song.id);
                      }}
                      disabled={addLoading === song.id}
                    >
                      {addLoading === song.id ? "Adding..." : "Add"}
                    </Button>
                  </Box>
                ))
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeAddDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={playlistSongsDialogOpen}
          onClose={closePlaylistSongsDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Playlist Player: "{selectedPlaylist?.name}"</DialogTitle>
          <DialogContent>
            {playlistSongsLoading ? (
              <Typography>Loading...</Typography>
            ) : playlistSongsError ? (
              <Typography color="error">{playlistSongsError}</Typography>
            ) : playlistSongs.length === 0 ? (
              <Typography>No songs in this playlist.</Typography>
            ) : (
              <>
                {/* MP3 Player Controls */}
                <Box
                  sx={{ mb: 2, p: 2, borderRadius: 2, background: "#181818" }}
                >
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {playlistSongs[playlistPlayerIndex]?.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {playlistSongs[playlistPlayerIndex]?.artist}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mt: 1,
                    }}
                  >
                    <IconButton onClick={handlePlaylistPrev}>
                      <SkipPreviousIcon />
                    </IconButton>
                    <IconButton onClick={handlePlaylistPlayPause}>
                      {playlistPlayerPlaying ? (
                        <PauseIcon />
                      ) : (
                        <PlayArrowIcon />
                      )}
                    </IconButton>
                    <IconButton onClick={handlePlaylistNext}>
                      <SkipNextIcon />
                    </IconButton>
                    {/* Show genre, purpose, emotionalState */}
                    {playlistSongs[playlistPlayerIndex]?.genre && (
                      <Typography
                        variant="caption"
                        color="primary"
                        sx={{ fontWeight: 500 }}
                      >
                        {playlistSongs[playlistPlayerIndex].genre}
                      </Typography>
                    )}
                    {playlistSongs[playlistPlayerIndex]?.purpose && (
                      <Typography
                        variant="caption"
                        color="secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {playlistSongs[playlistPlayerIndex].purpose}
                      </Typography>
                    )}
                    {playlistSongs[playlistPlayerIndex]?.emotionalState && (
                      <Typography variant="caption" color="text.secondary">
                        {playlistSongs[playlistPlayerIndex].emotionalState}
                      </Typography>
                    )}
                  </Box>
                  {/* Progress bar (sync with global player if possible) */}
                  <Slider
                    value={playlistPlayerProgress}
                    min={0}
                    max={playlistPlayerDuration || 100}
                    step={0.1}
                    onChange={() => {}}
                    aria-label="Progress"
                    sx={{ mt: 1 }}
                    disabled
                  />
                </Box>
                {/* Song List */}
                <Box>
                  {playlistSongs.map((song, idx) => (
                    <Box
                      key={song.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1,
                        p: 1,
                        borderRadius: 1,
                        background:
                          idx === playlistPlayerIndex ? "#1DB95422" : "#222",
                        cursor: "pointer",
                        border:
                          idx === playlistPlayerIndex
                            ? "2px solid #1DB954"
                            : undefined,
                      }}
                      onClick={() => handlePlaylistPlaySong(idx)}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography>{song.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {song.artist}
                        </Typography>
                      </Box>
                      {idx === playlistPlayerIndex && (
                        <Typography variant="caption" color="primary">
                          Now Playing
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closePlaylistSongsDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Playlists;
