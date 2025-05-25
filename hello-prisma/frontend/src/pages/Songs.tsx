import React from "react";
import { Container, Typography, Box, Grid } from "@mui/material";

const Songs: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Songs
        </Typography>
        <Grid container spacing={3}>
          {/* TODO: Add song cards here */}
        </Grid>
      </Box>
    </Container>
  );
};

export default Songs;
