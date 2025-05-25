import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const Profile: React.FC = () => {
  const { user, token } = useAuth();
  const [songCount, setSongCount] = useState<number | null>(null);
  const [playlistCount, setPlaylistCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!token) return;
      try {
        const [songsRes, playlistsRes] = await Promise.all([
          axios.get("http://localhost:3000/songs", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/playlists", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setSongCount(songsRes.data.length);
        setPlaylistCount(playlistsRes.data.length);
      } catch (err) {
        setSongCount(0);
        setPlaylistCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, [token]);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Avatar
              sx={{ width: 100, height: 100, mr: 3 }}
              alt="User Avatar"
              src="/static/images/avatar/1.jpg"
            />
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {user?.name || "User"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user?.email || "No email"}
              </Typography>
            </Box>
            <Button
              startIcon={<EditIcon />}
              sx={{ ml: "auto" }}
              onClick={() => {
                /* TODO: Implement edit profile */
              }}
            >
              Edit Profile
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : (
              <Box sx={{ display: "flex", gap: 4 }}>
                <Box>
                  <Typography variant="h4">{songCount}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Songs
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4">{playlistCount}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Playlists
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;
