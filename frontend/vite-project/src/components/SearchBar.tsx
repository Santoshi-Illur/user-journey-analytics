import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

interface Props { onSearch: (q: string) => void; }

const SearchBar: React.FC<Props> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  return (
    <Box display="flex" gap={1} mb={2}>
      <TextField label="User ID or Email" variant="outlined" size="small" value={query} onChange={(e) => setQuery(e.target.value)} />
      <Button variant="contained" onClick={() => onSearch(query)}>Search</Button>
    </Box>
  );
};

export default SearchBar;
