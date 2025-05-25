import React, { useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Paper,
  useTheme,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  VolumeOff,
} from "@mui/icons-material";
import { usePlayer } from "../contexts/PlayerContext";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const MusicPlayer: React.FC = () => {
  const theme = useTheme();
  const { currentSong, isPlaying, setIsPlaying } = usePlayer();
  const [volume, setVolume] = React.useState(50);
  const [isMuted, setIsMuted] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize YouTube player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("youtube-player", {
        height: "0",
        width: "0",
        playerVars: {
          autoplay: 0,
          controls: 0,
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              setProgress(0);
            }
          },
        },
      });
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [setIsPlaying]);

  useEffect(() => {
    if (playerRef.current && currentSong) {
      playerRef.current.loadVideoById(currentSong.youtubeId);
      setIsPlaying(true);
    }
  }, [currentSong, setIsPlaying]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
    setIsMuted(false);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <div id="youtube-player" style={{ display: "none" }} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Song Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap>
            {currentSong?.title || "No song selected"}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {currentSong?.artist || "Select a song to play"}
          </Typography>
        </Box>

        {/* Playback Controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small">
            <SkipPrevious />
          </IconButton>
          <IconButton onClick={handlePlayPause}>
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton size="small">
            <SkipNext />
          </IconButton>
        </Box>

        {/* Volume Control */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: 200 }}>
          <IconButton onClick={handleMuteToggle}>
            {isMuted ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
          <Slider
            size="small"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
          />
        </Box>
      </Box>

      {/* Progress Bar */}
      <Slider
        value={progress}
        onChange={(_, value) => setProgress(value as number)}
        aria-label="Progress"
        sx={{ mt: 1 }}
      />
    </Paper>
  );
};

export default MusicPlayer;
