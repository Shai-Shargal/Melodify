import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { usePlayer } from "../contexts/PlayerContext";
import { useSongs } from "../contexts/SongsContext";
import { Song } from "../types";

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

const Songs: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying } = usePlayer();
  const { songs, setSongs } = useSongs();
  const [open, setOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [editFields, setEditFields] = useState({
    rating: 0,
    purpose: "",
    emotionalState: "",
    isLiked: false,
    genre: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchArtist, setSearchArtist] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const fetchSongs = async () => {
    try {
      const response = await axios.get("http://localhost:3000/songs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSongs(response.data);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [token]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setYoutubeUrl("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/songs",
        { youtubeUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSongs([response.data, ...songs]);
      handleClose();
    } catch (error: any) {
      setError(
        error.response?.data?.error || "Failed to add song. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (songId: string) => {
    try {
      await axios.delete(`http://localhost:3000/songs/${songId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSongs(songs.filter((song) => song.id !== songId));
      if (currentSong?.id === songId) {
        setCurrentSong(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error deleting song:", error);
    }
  };

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const openEditDialog = (song: Song) => {
    setEditSong(song);
    setEditFields({
      rating: song.rating ?? 0,
      purpose: song.purpose ?? "",
      emotionalState: song.emotionalState ?? "",
      isLiked: song.isLiked ?? false,
      genre: song.genre ?? "",
    });
    setEditOpen(true);
  };
  const closeEditDialog = () => {
    setEditOpen(false);
    setEditSong(null);
  };
  const handleEditFieldChange = (field: string, value: any) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };
  const handleEditSave = async () => {
    if (!editSong) return;
    setEditLoading(true);
    try {
      const response = await axios.patch(
        `http://localhost:3000/songs/${editSong.id}`,
        editFields,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSongs((prev) =>
        prev.map((s) => (s.id === editSong.id ? { ...s, ...response.data } : s))
      );
      closeEditDialog();
    } catch (error) {
      alert("Failed to update song");
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenSearch = () => {
    setSearchOpen(true);
    setSearchArtist("");
    setSearchTitle("");
    setSearchResults([]);
    setSearchError("");
  };
  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchArtist("");
    setSearchTitle("");
    setSearchResults([]);
    setSearchError("");
  };
  const handleSearchYouTube = async () => {
    setSearchLoading(true);
    setSearchError("");
    setSearchResults([]);
    try {
      const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
      const query = encodeURIComponent(`${searchArtist} ${searchTitle}`);
      const res = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${query}&key=${apiKey}`
      );
      setSearchResults(res.data.items || []);
    } catch (err) {
      setSearchError("Failed to search YouTube");
    } finally {
      setSearchLoading(false);
    }
  };
  const handleAddSearchedSong = async (video: any) => {
    setLoading(true);
    setError("");
    try {
      const youtubeUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
      const response = await axios.post(
        "http://localhost:3000/songs",
        { youtubeUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSongs([response.data, ...songs]);
      handleCloseSearch();
    } catch (error: any) {
      setError(
        error.response?.data?.error || "Failed to add song. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ color: "white" }}>
          Your Songs
        </Typography>
        <Box
          sx={{ display: "flex", gap: 2, mb: 4, justifyContent: "flex-end" }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Add Song with URL
          </Button>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={handleOpenSearch}
          >
            Add Song by Search
          </Button>
        </Box>
      </Box>

      <Paper
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <List>
          {songs.map((song) => (
            <Box
              key={song.id}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                p: 2,
                borderRadius: 1,
                background: "#222",
                position: "relative",
                minHeight: 80,
              }}
            >
              {song.thumbnail && (
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 2,
                    borderRadius: 1,
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap>{song.title}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {song.artist}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mt: 0.5,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Rating Stars */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        sx={{
                          fontSize: 16,
                          color:
                            song.rating && song.rating >= star
                              ? "primary.main"
                              : "text.disabled",
                        }}
                      />
                    ))}
                  </Box>
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
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}
              >
                <IconButton
                  onClick={() => handlePlay(song)}
                  sx={{ color: theme.palette.primary.main }}
                >
                  {currentSong?.id === song.id && isPlaying ? (
                    <PauseIcon />
                  ) : (
                    <PlayIcon />
                  )}
                </IconButton>
                <IconButton onClick={() => openEditDialog(song)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(song.id)}
                  sx={{ color: "error.main" }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Song</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="YouTube URL"
              type="text"
              fullWidth
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              error={!!error}
              helperText={error}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !youtubeUrl}
            >
              {loading ? "Adding..." : "Add Song"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={editOpen} onClose={closeEditDialog}>
        <DialogTitle>Edit Song</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography sx={{ mr: 1 }}>Rating:</Typography>
            {[1, 2, 3, 4, 5].map((star) => (
              <IconButton
                key={star}
                onClick={() => handleEditFieldChange("rating", star)}
                color={editFields.rating >= star ? "primary" : "default"}
              >
                {editFields.rating >= star ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            ))}
          </Box>
          <TextField
            select
            label="Purpose"
            value={editFields.purpose}
            onChange={(e) => handleEditFieldChange("purpose", e.target.value)}
            fullWidth
            margin="dense"
            SelectProps={{ native: true }}
            sx={{ mb: 2 }}
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
            value={editFields.emotionalState}
            onChange={(e) =>
              handleEditFieldChange("emotionalState", e.target.value)
            }
            fullWidth
            margin="dense"
            SelectProps={{ native: true }}
            sx={{ mb: 2 }}
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
            value={editFields.genre}
            onChange={(e) => handleEditFieldChange("genre", e.target.value)}
            fullWidth
            margin="dense"
            SelectProps={{ native: true }}
            sx={{ mb: 2 }}
          >
            <option value=""></option>
            {genreOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </TextField>
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Typography sx={{ mr: 1 }}>Liked:</Typography>
            <IconButton
              onClick={() =>
                handleEditFieldChange("isLiked", !editFields.isLiked)
              }
            >
              {editFields.isLiked ? (
                <FavoriteIcon color="error" />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={editLoading}
          >
            {editLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={searchOpen} onClose={handleCloseSearch}>
        <DialogTitle>Search and Add Song from YouTube</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Artist"
            type="text"
            fullWidth
            value={searchArtist}
            onChange={(e) => setSearchArtist(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Song Title"
            type="text"
            fullWidth
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSearchYouTube}
            disabled={!searchArtist || !searchTitle || searchLoading}
            sx={{ mb: 2 }}
          >
            {searchLoading ? "Searching..." : "Search"}
          </Button>
          {searchError && <Typography color="error">{searchError}</Typography>}
          {searchResults.length > 0 && (
            <Box>
              {searchResults.map((video) => (
                <Box
                  key={video.id.videoId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    background: "#222",
                  }}
                >
                  <img
                    src={video.snippet.thumbnails.default.url}
                    alt={video.snippet.title}
                    style={{ width: 60, height: 45, marginRight: 8 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography>{video.snippet.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {video.snippet.channelTitle}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleAddSearchedSong(video)}
                    disabled={loading}
                  >
                    Add
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSearch}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Songs;
