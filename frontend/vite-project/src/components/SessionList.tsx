import React from "react";
import type { Session } from "../types/session";
import { Card, CardContent, Typography, Button, Grid } from "@mui/material";

const SessionList: React.FC<{ sessions: Session[], onView: (id: string) => void }> = ({ sessions, onView }) => {
  return (
    <Grid container spacing={2}>
      {sessions.map(s => (
        <Grid item xs={12} md={6} key={s.sessionId}>
          <Card>
            <CardContent>
              <Typography>Start: {new Date(s.sessionStart).toLocaleString()}</Typography>
              <Typography>Pages: {s.pagesVisited} • Purchases: {s.purchaseCount}</Typography>
              <Button variant="outlined" size="small" onClick={() => onView(s.sessionId)}>View Timeline</Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SessionList;
