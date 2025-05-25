import React from "react";
import { Container, Typography, Box } from "@mui/material";

const Home: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Melodify
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Your personal music collection
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
