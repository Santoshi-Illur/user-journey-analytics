import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";

const FunnelView: React.FC = () => {
  const steps = [
    { name: "Search", count: 100 },
    { name: "Product View", count: 75 },
    { name: "Add to Cart", count: 40 },
    { name: "Purchase", count: 20 },
  ];
  const max = Math.max(...steps.map(s => s.count));

  return (
    <Box>
      <Typography variant="h6">Funnel</Typography>
      {steps.map((s) => (
        <Box key={s.name} mb={1}>
          <Typography variant="body2">{s.name} ({s.count})</Typography>
          <LinearProgress variant="determinate" value={(s.count / max) * 100} />
        </Box>
      ))}
    </Box>
  );
};

export default FunnelView;
