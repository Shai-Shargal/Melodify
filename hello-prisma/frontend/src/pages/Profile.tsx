import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const Profile: React.FC = () => {
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
                User Name
              </Typography>
              <Typography variant="body1" color="text.secondary">
                user@example.com
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
            <Box sx={{ display: "flex", gap: 4 }}>
              <Box>
                <Typography variant="h4">0</Typography>
                <Typography variant="body2" color="text.secondary">
                  Songs
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4">0</Typography>
                <Typography variant="body2" color="text.secondary">
                  Playlists
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;
