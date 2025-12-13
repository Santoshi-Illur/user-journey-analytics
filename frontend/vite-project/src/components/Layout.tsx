// src/components/Layout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";
import Header from "./Header";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const Layout: React.FC = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f7f9fc" }}>
        <Header />
        <Container maxWidth="xl" sx={{ pt: 3, pb: 6 }}>
          <Outlet />
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default Layout;
