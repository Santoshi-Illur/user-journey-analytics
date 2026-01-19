import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { FUNNEL_STAGE_KEYS } from "../constants/Funnelstage";
import DateRangeSelector from "../components/DateRangeSelector";
import type { DateRange } from "../components/DateRangeSelector";
import { useTranslation } from "react-i18next";
/* ---------------- Types ---------------- */

interface FunnelStage {
  stage: string;
  eventType: string;
  count: number;
  conversionPercent: number;
}

interface FunnelResponse {
  success: boolean;
  funnel: FunnelStage[];
}

/* ---------------- Colors ---------------- */

const FUNNEL_COLORS = [
  "#1976d2", // blue
  "#42a5f5", // light blue
  "#fbc02d", // yellow
  "#ff9800", // orange
  "#66bb6a", // green
  "#2e7d32", // dark green
];

/* ---------------- Component ---------------- */

export default function FunnelAnalysisPage() {
  const navigate = useNavigate();

  /* -------- Filters -------- */
  const [device, setDevice] = useState("");
  const [country, setCountry] = useState("");
  const [range, setRange] = useState<DateRange>({
    start: dayjs().subtract(30, "day"),
    end: dayjs(),
  });

  /* -------- Data -------- */
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [loading, setLoading] = useState(true);
const { t } = useTranslation();

  /* -------- API Call -------- */
  useEffect(() => {
    async function loadFunnel() {
      try {
        setLoading(true);
        const res = await axios.get<FunnelResponse>(
          "http://localhost:4000/api/funnel",
          {
            params: {
              start: range.start?.toISOString(),
              end: range.end?.toISOString(),
              device: device || undefined,
              country: country || undefined,
            },
          }
        );

        setFunnel(res.data.funnel || []);
      } catch (err) {
        console.error("Failed to load funnel data", err);
      } finally {
        setLoading(false);
      }
    }

    loadFunnel();
  }, [range, device, country]);

  /* ---------------- UI ---------------- */

  return (
    <Box p={3}>
      {/* ---------- Header ---------- */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight={600}>
          {t("funnelAnalysis")}
        </Typography>

        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("/app/dashboard")}
        >
          {t("backToDashboard")}

        </Button>
      </Stack>

      {/* ---------- Filters ---------- */}
      <Stack direction="row" spacing={2} mb={3}>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>{t("device")}</InputLabel>
          <Select
            label="Device"
            value={device}
            onChange={(e) => setDevice(e.target.value)}
          >
            <MenuItem value="">{t("all")}</MenuItem>
            <MenuItem value="Mobile">{t("mobile")}</MenuItem>
            <MenuItem value="Desktop">{t("desktop")}</MenuItem>
            <MenuItem value="Tablet">{t("tablet")}</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>{t("country")}</InputLabel>
          <Select
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <MenuItem value="">{t("all")}</MenuItem>
            <MenuItem value="India">{t("india")}</MenuItem>
            <MenuItem value="USA">{t("usa")}</MenuItem>
            <MenuItem value="UK">{t("uk")}</MenuItem>
            <MenuItem value="Germany">{t("germany")}</MenuItem>
            <MenuItem value="Canada">{t("canada")}</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Box mb={4}>
        <DateRangeSelector range={range} onChange={setRange} />
      </Box>

      {/* ---------- Funnel ---------- */}
      <Card>
        <CardContent>
          {loading ? (
            <Typography>{t("loadingFunnel")}</Typography>
          ) : (
            <Stack spacing={2}>
              {funnel.map((step, index) => {
                const max = funnel[0]?.count || 1;
                const widthPercent = Math.max(
                  12,
                  (step.count / max) * 100
                );

                return (
                  <Box key={step.eventType}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={0.5}
                    >
                      <Typography fontWeight={500}>
                         {index + 1}. {t(FUNNEL_STAGE_KEYS[step.eventType] ?? step.stage)}
                      </Typography>
                      <Typography color="text.secondary">
                        {step.count} ({step.conversionPercent}%)
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        height: 26,
                        width: `${widthPercent}%`,
                        backgroundColor:
                          FUNNEL_COLORS[index % FUNNEL_COLORS.length],
                        borderRadius: 1.5,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
