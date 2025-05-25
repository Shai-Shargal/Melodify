import React from "react";
import { Container, Typography, Box, Grid, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const Playlists: React.FC = () => {
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
            onClick={() => {
              /* TODO: Implement create playlist */
            }}
          >
            Create Playlist
          </Button>
        </Box>
        <Grid container spacing={3}>
          {/* TODO: Add playlist cards here */}
        </Grid>
      </Box>
    </Container>
  );
};

export default Playlists;
