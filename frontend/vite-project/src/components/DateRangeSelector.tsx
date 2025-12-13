import React from "react";
import { Stack, TextField, IconButton } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import ClearIcon from "@mui/icons-material/Clear";

export interface DateRange {
  start: Dayjs | null;
  end: Dayjs | null;
}

interface Props {
  range: DateRange;
  onChange: (r: DateRange) => void;
}

export default function DateRangeSelector({ range, onChange }: Props) {
  const handleStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? dayjs(e.target.value) : null;
    onChange({ ...range, start: value });
  };

  const handleEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? dayjs(e.target.value) : null;
    onChange({ ...range, end: value });
  };

  const clear = () => onChange({ start: null, end: null });

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField
        type="date"
        label="Start Date"
        value={range.start ? range.start.format("YYYY-MM-DD") : ""}
        onChange={handleStart}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        type="date"
        label="End Date"
        value={range.end ? range.end.format("YYYY-MM-DD") : ""}
        onChange={handleEnd}
        InputLabelProps={{ shrink: true }}
      />

      <IconButton onClick={clear}>
        <ClearIcon />
      </IconButton>
    </Stack>
  );
}
