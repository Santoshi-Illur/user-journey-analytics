// src/pages/UserSearchPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Box } from "@mui/material";

const UserSearchPage: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!userId) return alert("Enter user ID");
    navigate(`/journey/${userId}?start=${startDate}&end=${endDate}`);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </Box>
    </Container>
  );
};

export default UserSearchPage;
