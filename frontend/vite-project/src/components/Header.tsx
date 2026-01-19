// src/components/Header.tsx
import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={1}
      sx={{ borderBottom: "1px solid #eee" }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* LEFT: Title */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{ color: "#0b5cff", fontWeight: 700 }}
          >
            {t("appTitle")}
          </Typography>
        </Box>

        {/* RIGHT: Language Switch */}
        <LanguageSwitcher />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
