// src/components/Header.tsx
import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";

const Header: React.FC = () => {
  return (
    <AppBar position="sticky" color="inherit" elevation={1} sx={{ borderBottom: "1px solid #eee" }}>
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ flexShrink: 0 }}>
          <Typography variant="h6" sx={{ color: "#0b5cff", fontWeight: 700 }}>
            User Journey Analytics
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
