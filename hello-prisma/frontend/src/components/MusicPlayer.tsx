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

// Add Song type for TypeScript
interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const MusicPlayer: React.FC<{ songs?: Song[] }> = ({ songs = [] }) => {
  const theme = useTheme();
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying } = usePlayer();
  const [volume, setVolume] = React.useState(50);
  const [isMuted, setIsMuted] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<any>(null);

  // Find current song index
  const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);

  // Next/Previous handlers
  const handleNext = () => {
    if (songs.length === 0 || currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };
  const handlePrevious = () => {
    if (songs.length === 0 || currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  };

  // YouTube Player setup
  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

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
              handleNext();
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setDuration(playerRef.current.getDuration());
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          },
        },
      });
    };
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [setIsPlaying]);

  // Load video when song changes
  useEffect(() => {
    if (playerRef.current && currentSong) {
      playerRef.current.loadVideoById(currentSong.youtubeId);
      setIsPlaying(true);
      setProgress(0);
    }
  }, [currentSong, setIsPlaying]);

  // Play/pause control
  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  // Volume control
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  // Progress polling
  useEffect(() => {
    if (playerRef.current && isPlaying) {
      progressInterval.current = setInterval(() => {
        const current = playerRef.current.getCurrentTime?.() || 0;
        setProgress(current);
        setDuration(playerRef.current.getDuration?.() || 0);
      }, 500);
      return () => clearInterval(progressInterval.current);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
  }, [isPlaying]);

  // Seek
  const handleSeek = (_: Event, value: number | number[]) => {
    if (playerRef.current) {
      playerRef.current.seekTo(value as number, true);
      setProgress(value as number);
    }
  };

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      // setIsPlaying will be handled by player events
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
          <IconButton
            size="small"
            onClick={handlePrevious}
            disabled={songs.length <= 1}
          >
            <SkipPrevious />
          </IconButton>
          <IconButton onClick={handlePlayPause} disabled={!currentSong}>
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton
            size="small"
            onClick={handleNext}
            disabled={songs.length <= 1}
          >
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
        min={0}
        max={duration}
        step={0.1}
        onChange={handleSeek}
        aria-label="Progress"
        sx={{ mt: 1 }}
      />
    </Paper>
  );
};

export default MusicPlayer;
