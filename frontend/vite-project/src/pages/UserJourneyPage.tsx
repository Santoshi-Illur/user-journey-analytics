import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";

import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import type { DateRange } from "../components/DateRangeSelector";
import DateRangeSelector  from "../components/DateRangeSelector";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

type BackendResponse = {
  success?: boolean;
  user: {
    _id: string;
    name: string;
    email?: string;
    device?: string;
    country?: string;
    createdAt?: string;
    // ...
  };
  metrics: {
    pagesVisited: number;
    purchaseCount: number;
    totalTime: number; // seconds
    sessionsCount: number;
  };
  // sessions: array of session objects. Example shape assumed:
  // { sessionId?, sessionStart: string, pagesVisited: number, purchaseCount: number, totalTime: number, events?: [...] }
  sessions: Array<Record<string, any>>;
  // trend: array of { date: "2025-11-12", pageVisits, purchases, timeSpent }
  trend: Array<{ date: string; pageVisits?: number; purchases?: number; timeSpent?: number }>;
};

export default function UserJourneyPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Date range default to last 30 days (same as dashboard)
  const [range, setRange] = useState<DateRange>({
    start: dayjs().subtract(30, "day"),
    end: dayjs(),
  });

  const [data, setData] = useState<BackendResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
const { t } = useTranslation();
  const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    const fetchJourney = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          start: range.start ? range.start.format("YYYY-MM-DD") : undefined,
          end: range.end ? range.end.format("YYYY-MM-DD") : undefined,
        };

        const res = await axios.get<BackendResponse>(`${API_BASE}/user/${id}/journey`, { params });

        if (cancelled) return;
        setData(res.data);
      } catch (err: any) {
        console.error("Failed to load user journey:", err);
        setError(err?.message || "Failed to load data");
        setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchJourney();
    return () => {
      cancelled = true;
    };
  }, [id, range, API_BASE]);

  // Chart data derived from trend
  const chartData = useMemo(() => {
    const labels = (data?.trend ?? []).map((t) => t.date);
    const visits = (data?.trend ?? []).map((t) => t.pageVisits ?? 0);
    const purchases = (data?.trend ?? []).map((t) => t.purchases ?? 0);
    const timeSpent = (data?.trend ?? []).map((t) => t.timeSpent ?? 0);

    return {
      labels,
      datasets: [
        {
          label: "Page Visits",
          data: visits,
          borderColor: "#1976d2",
          backgroundColor: "rgba(25,118,210,0.15)",
          tension: 0.3,
          fill: true,
        },
        {
          label: "Purchases",
          data: purchases,
          borderColor: "#f39c12",
          backgroundColor: "rgba(243,156,18,0.12)",
          tension: 0.3,
          fill: false,
        },
        {
          label: "Time Spent (sec)",
          data: timeSpent,
          borderColor: "#8e24aa",
          backgroundColor: "rgba(142,36,170,0.10)",
          tension: 0.3,
          fill: false,
          yAxisID: "yTime",
        },
      ],
    };
  }, [data?.trend]);

  // Chart options (Chart.js v4 typesafe)
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            const label = context.dataset.label ?? "";
            const value = context.parsed?.y ?? context.parsed ?? 0;
            if (String(label).toLowerCase().includes("time")) {
              // format seconds as mm:ss
              const secs = Number(value || 0);
              const mm = Math.floor(secs / 60)
                .toString()
                .padStart(2, "0");
              const ss = Math.floor(secs % 60)
                .toString()
                .padStart(2, "0");
              return `${label}: ${mm}:${ss}`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: function (this: any, tickValue: string | number, index: number): string {
            const labels = (this as any)?.chart?.data?.labels;
            const raw = labels?.[index] ?? labels?.[Number(tickValue)];
            return raw ? dayjs(String(raw)).format("MMM D") : "";
          },
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        position: "left",
        title: { display: true, text: "Count" } as any,
      },
      // second Y axis for timeSpent if needed
      yTime: {
        beginAtZero: true,
        position: "right",
        grid: { display: false },
        ticks: {
          callback: function (tickValue: string | number) {
            // show seconds
            return String(tickValue);
          },
        },
      } as any,
    },
  };

  // Render helpers
  const formatSecondsToMmSs = (secs: number) => {
    const mm = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(secs % 60)
      .toString()
      .padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Derived content for sessions/events
  const sessions = data?.sessions ?? [];
  // If sessions have nested events, we'll flatten for events table if needed
  const flattenedEvents = useMemo(() => {
    const arr: Array<Record<string, any>> = [];
    (sessions || []).forEach((s: any) => {
      if (Array.isArray(s.events)) {
        s.events.forEach((ev: any) => {
          arr.push({
            sessionStart: s.sessionStart ?? s.sessionStartTime ?? s.start ?? null,
            ...ev,
          });
        });
      }
    });
    return arr;
  }, [sessions]);

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {t("userJourneyTitle")} — {data?.user?.name ?? id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.user?.email ?? ""}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate("/app/dashboard")}>
         {t("backToDashboard")}

          </Button>
        </Stack>
      </Stack>

      <Box mb={3}>
        <DateRangeSelector
          range={range}
          onChange={(r: DateRange) => {
            setRange(r);
          }}
        />
      </Box>

      {loading ? (
        <Box py={6} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box p={3}>
          <Typography color="error">  {t("loadingUserJourneyError")}: {error}</Typography>
        </Box>
      ) : !data ? (
        <Box p={3}>
          <Typography>{t("noData")}</Typography>
        </Box>
      ) : (
        <>
          {/* KPI cards (as small cards) */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                 {t("pagesVisited")}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {data.metrics?.pagesVisited ?? 0}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("purchases")}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {data.metrics?.purchaseCount ?? 0}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                 {t("timeSpentMin")} 
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {/* convert seconds to minutes (rounded) */}
                  {Math.round((data.metrics?.totalTime ?? 0) / 60)}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("sessions")}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {data.metrics?.sessionsCount ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          {/* Chart + Sessions side-by-side */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" mb={1}>
                {t("eventTrend")}
                </Typography>
                <Box sx={{ height: 320 }}>
                  <Line data={chartData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" mb={1}>
                     {t("sessions")}
                </Typography>

                {sessions.length === 0 ? (
                  <Typography color="text.secondary">{t("noSessions")}</Typography>
                ) : (
                  <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("sessionStart")}t</TableCell>
                          <TableCell align="right">{t("pages")}</TableCell>
                          <TableCell align="right">{t("purchases")}</TableCell>
                          <TableCell align="right">{t("timeMmSs")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sessions.map((s: any, idx: number) => (
                          <TableRow key={s.sessionId ?? s._id ?? idx}>
                            <TableCell>
                              {s.sessionStart ? dayjs(String(s.sessionStart)).format("YYYY-MM-DD HH:mm") : "-"}
                            </TableCell>
                            <TableCell align="right">{s.pagesVisited ?? 0}</TableCell>
                            <TableCell align="right">{s.purchases ?? 0}</TableCell>
                            <TableCell align="right">
                              {typeof s.timeSpent === "number" ? formatSecondsToMmSs(s.timeSpent) : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Stack>

          {/* Events table (flattened if present) */}
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1}>
                {t("eventDetails")}
              </Typography>

              {flattenedEvents.length === 0 ? (
                <Typography color="text.secondary">{t("noEvents")}</Typography>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 420 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("sessionStart")}</TableCell>
                        <TableCell>{t("event")}</TableCell>
                        <TableCell>{t("page")}</TableCell>
                        <TableCell>{t("time")}</TableCell>
                        <TableCell align="right">{t("durationSec")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {flattenedEvents.map((ev, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {ev.sessionStart ? dayjs(String(ev.sessionStart)).format("YYYY-MM-DD HH:mm") : "-"}
                          </TableCell>
                          <TableCell>{ev.event ?? ev.eventType ?? "-"}</TableCell>
                          <TableCell>{ev.page ?? "-"}</TableCell>
                          <TableCell>{ev.time ?? ev.timestamp ?? "-"}</TableCell>
                          <TableCell align="right">{ev.duration ?? ev.durationSec ?? "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
