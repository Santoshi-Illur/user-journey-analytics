import React from "react";
import type { Event } from "../types/event";
import { Box, Typography, Paper } from "@mui/material";

const Timeline: React.FC<{ events: Event[] }> = ({ events }) => {
  return (
    <Box>
      <Typography variant="h6" mb={1}>Timeline</Typography>
      <Box display="flex" gap={2} overflow="auto">
        {events.map(e => (
          <Paper key={e.eventId} sx={{ p: 1, minWidth: 60, textAlign: "center" }}>
            <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "primary.main", color: "#fff", mx: "auto", lineHeight: "40px" }}>
              {e.eventType[0].toUpperCase()}
            </Box>
            <Typography variant="caption">{e.eventType}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Timeline;
