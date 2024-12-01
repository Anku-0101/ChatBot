import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";

export const LoginUI: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError(null);
      setMessage(null);
      const response = await fetch("http://localhost:8001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId); // Save userId for later use
        navigate("/chat");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Invalid login credentials");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleSignUp = async () => {
    try {
      setError(null);
      setMessage(null);
      const response = await fetch("http://localhost:8001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Could not register user.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: "400px",
        margin: "auto",
        padding: "30px",
        marginTop: "100px",
        textAlign: "center",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Login / Sign-Up
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {message && <Typography color="primary">{message}</Typography>}
      <Box component="form" sx={{ mt: 2 }}>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            fullWidth
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleSignUp}
            fullWidth
          >
            Sign-Up
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
