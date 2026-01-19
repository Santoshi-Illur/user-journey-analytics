// src/pages/LoginPage.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useTranslation } from "react-i18next";

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg(t("emailPasswordRequired"));
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password }
      );

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        onLogin();
      } else {
        setErrorMsg(res.data?.message || t("invalidLogin"));
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t("loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f6f7",
      }}
    >
      <Card sx={{ width: 420, padding: 2, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" mb={2}>
            {t("loginTitle")}
          </Typography>

          <TextField
            label={t("email")}
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label={t("password")}
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMsg && (
            <Typography color="error" mt={1} fontSize={14}>
              {errorMsg}
            </Typography>
          )}

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3, height: 45 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              t("login")
            )}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
