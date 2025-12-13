import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(" Login →", { email, password });
    try {
      const res = await login({ email, password }).unwrap();
      localStorage.setItem("token", res.token);
      navigate("/app/dashboard");
    } catch (err) {
      alert("Login failed");
    }

    // TODO: redirect to dashboard page after we build it
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Email"
        type="email"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        fullWidth
        label="Password"
        type="password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 3, py: 1.2, fontWeight: 600, borderRadius: 2 }}
      >
        Login
      </Button>

      <Typography mt={2} fontSize={14} textAlign="center" color="text.secondary">
        Demo Login — No backend connected yet.
      </Typography>
    </Box>
  );
};

export default LoginForm;
