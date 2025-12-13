import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";

import type { UserProfile } from "../types/user";

const UserOverview: React.FC<{ user?: UserProfile }> = ({ user }) => {
  if (!user) {
    return (
      <Card>
        <CardContent>No user selected</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Grid2 container spacing={2}>
          <Grid2 xs={12}>
            <Typography variant="h6">User Overview</Typography>
          </Grid2>

          <Grid2 xs={6}>
            <Typography>Name: {user.name}</Typography>
          </Grid2>

          <Grid2 xs={6}>
            <Typography>Email: {user.email}</Typography>
          </Grid2>
        </Grid2>
      </CardContent>
    </Card>
  );
};

export default UserOverview;

