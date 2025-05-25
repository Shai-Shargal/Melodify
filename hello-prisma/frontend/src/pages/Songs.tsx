import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeUrl: string;
  createdAt: string;
}

interface Playlist {
  id: string;
  name: string;
}

const Songs: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [open, setOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [error, setError] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const fetchSongs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:3000/songs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSongs(response.data);
    } catch (err) {
      console.error("Error fetching songs:", err);
    }
  };

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
      fetchSongs();
      fetchPlaylists();
    }
  }, [isAuthenticated]);

  const handleOpen = () => {
    if (!isAuthenticated) {
      setError("Please log in to add songs");
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setYoutubeUrl("");
    setError("");
  };

  const handleAddToPlaylist = (song: Song) => {
    setSelectedSong(song);
    setAddToPlaylistOpen(true);
  };

  const handleAddToPlaylistClose = () => {
    setAddToPlaylistOpen(false);
    setSelectedSong(null);
    setSelectedPlaylist("");
  };

  const handleAddToPlaylistSubmit = async () => {
    if (!selectedSong || !selectedPlaylist) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        `http://localhost:3000/playlists/${selectedPlaylist}/songs`,
        { songId: selectedSong.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      handleAddToPlaylistClose();
    } catch (err) {
      console.error("Error adding song to playlist:", err);
      setError("Failed to add song to playlist");
    }
  };

  const handleAddSong = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to add songs");
        return;
      }

      await axios.post(
        "http://localhost:3000/songs",
        { youtubeUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      handleClose();
      fetchSongs();
    } catch (err) {
      setError("Failed to add song. Please check the YouTube URL.");
      console.error("Add song error:", err);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.delete(`http://localhost:3000/songs/${songId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchSongs();
    } catch (err) {
      console.error("Error deleting song:", err);
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
            My Songs
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            Add Song
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          {songs.map((song) => (
            <Card key={song.id}>
              <CardContent>
                <Typography variant="h6" component="h2">
                  {song.title}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {song.artist}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Added: {new Date(song.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleAddToPlaylist(song)}>
                  Add to Playlist
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteSong(song.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add New Song</DialogTitle>
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
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleAddSong} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={addToPlaylistOpen} onClose={handleAddToPlaylistClose}>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Playlist</InputLabel>
              <Select
                value={selectedPlaylist}
                label="Select Playlist"
                onChange={(e) => setSelectedPlaylist(e.target.value)}
              >
                {playlists.map((playlist) => (
                  <MenuItem key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddToPlaylistClose}>Cancel</Button>
            <Button
              onClick={handleAddToPlaylistSubmit}
              variant="contained"
              disabled={!selectedPlaylist}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Songs;
