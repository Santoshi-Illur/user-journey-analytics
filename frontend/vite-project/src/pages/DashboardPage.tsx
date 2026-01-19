// src/pages/DashboardPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  CircularProgress,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { useTranslation } from "react-i18next";
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

import DateRangeSelector from "../components/DateRangeSelector";
import type { DateRange } from "../components/DateRangeSelector";
import useDebounce from "../hooks/useDebounce";
import { red } from "@mui/material/colors";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

// --- Types
type ApiUser = {
  userId: string;
  name: string;
  email?: string;
  device?: string;
  country?: string;
  pagesVisited?: number;
  purchases?: number;
  timeSpent?: number;
};

type ApiResponse = {
  users?: ApiUser[];
  trendData?: { date: string; pageVisits?: number; purchases?: number; timeSpent?: number }[]; //tiles data
  pagination?: { page?: number; limit?: number; totalUsers?: number };
  metrics?: { totalEvents?: number; purchases?: number; totalTimeSec?: number; uniqueUsers?: number };
};

export default function DashboardPage(): JSX.Element {
  const navigate = useNavigate();
const { t, i18n } = useTranslation();
  // Filters
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 350);

  const [device, setDevice] = useState<string>(""); // filter
  const [country, setCountry] = useState<string>(""); // filter
  const [eventType, setEventType] = useState<string>(""); // filter


// Map language → locale
const locale = i18n.language === "es" ? "es-ES" : "en-US";

  const [range, setRange] = useState<DateRange>({
    start: dayjs().subtract(30, "day"),
    end: dayjs(),
  });

  // Data
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [trendData, setTrendData] = useState<ApiResponse["trendData"]>([]);
  const [metrics, setMetrics] = useState<ApiResponse["metrics"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination (UI)
  const [page, setPage] = useState<number>(0); // MUI is 0-based
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";

  // Build query params
  const apiParams = useMemo(() => {
    return {
      q: debouncedSearch || undefined,
      device: device || undefined,
      country: country || undefined,
      eventType: eventType || undefined,
      start: range.start ? range.start.format("YYYY-MM-DD") : undefined,
      end: range.end ? range.end.format("YYYY-MM-DD") : undefined,
      page: page + 1, // backend expects 1-based
      limit: rowsPerPage,
    };
  }, [debouncedSearch, device, country, eventType, range, page, rowsPerPage]);

  // Fetch data on param change
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get<ApiResponse>(`${API_BASE}/dashboard`, { params: apiParams });

        if (cancelled) return;

        setUsers(res.data.users ?? []);
        setTrendData(res.data.trendData ?? []);
        setMetrics(res.data.metrics ?? null);
        setTotalUsers(res.data.pagination?.totalUsers ?? 0);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
        setUsers([]);
        setTrendData([]);
        setMetrics(null);
        setTotalUsers(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [apiParams, API_BASE]);

  // Clear filters — keep default last 30 days
  const handleClear = () => {
    setSearch("");
    setDevice("");
    setCountry("");
    setEventType("");
    setRange({ start: dayjs().subtract(30, "day"), end: dayjs() });
    setPage(0);
  };



  // Chart configs (each with its own color)
  const makeChartData = (field: "pageVisits" | "purchases" | "timeSpent", colorHex: string) => {
    const labels = trendData?.map((t) => t.date) ?? [];
    const data = trendData?.map((t) => (t as any)[field] ?? 0) ?? [];

    return {
      labels,
      datasets: [
        {
          label: field === "timeSpent" ? "Time Spent (sec)" : field === "purchases" ? "Purchases" : "Page Visits",
          data,
          borderColor: colorHex,
          backgroundColor: `${colorHex}33`, // add alpha via hex suffix (works for 6-hex colors)
          fill: true,
          tension: 0.25,
          pointRadius: 2,
        },
      ],
    };
  };

  // Chart options typed properly
  const baseChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            const raw = context.parsed?.y;
            if (context.dataset.label?.toLowerCase().includes("time")) {
              // format seconds to mm:ss
              const secs = Number(raw ?? 0);
              const mm = Math.floor(secs / 60)
                .toString()
                .padStart(2, "0");
              const ss = Math.floor(secs % 60)
                .toString()
                .padStart(2, "0");
              return `${context.dataset.label}: ${mm}:${ss}`;
            }
            return `${context.dataset.label}: ${raw ?? 0}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          // Proper v4 signature: (this: Scale, tickValue: string | number, index: number, ticks: Tick[]) => ...
          callback: function (this: any, tickValue: string | number, index: number): string {
            // Use index lookup on labels — safer across scale types
            const labels = (this as any)?.chart?.data?.labels;
            const raw = labels?.[index] ?? labels?.[Number(tickValue)];
            // return raw ? dayjs(String(raw)).format("MMM D") : "";
            return raw
  ? dayjs(String(raw))
      .locale(i18n.language)
      .format("MMM D")
  : "";

          },
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.06)" },
      },
    },
  };

  const pageVisitsData = makeChartData("pageVisits", "#1976d2"); // blue
  const purchasesData = makeChartData("purchases", "#8e44ad"); // purple
  const timeSpentData = makeChartData("timeSpent", "#f39c12"); // yellow/orange

  // Pagination handlers
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#0b4f8a">
  {t("dashboardTitle")}
</Typography>
<Typography variant="body2" color="text.secondary">
  {t("dashboardSubtitle")}
</Typography>

        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
           <Button
      variant="outlined"
      color="primary"
      onClick={() => navigate("/app/funnel")}
    >
       {t("viewFunnel")}
    </Button>
          <IconButton
            title="Refresh"
            onClick={() => {
              // force refetch by toggling page (or reassigning apiParams)
              setPage(0);
            }}
          >
            <RefreshIcon />
          </IconButton>

          <Button variant="contained" onClick={handleClear} color="primary">
            {t("clear")}
          </Button>
        </Stack>
      </Stack>


 {/* Filters row */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2} alignItems="center">
        <TextField
          placeholder={t("searchPlaceholder")}
          label={t("search")}
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ flex: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>{t("device")}</InputLabel>
          <Select
            value={device}
            label={t("device")}
            onChange={(e) => {
              setDevice(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">{t("all")}</MenuItem>
        <MenuItem value="Mobile">{t("mobile")}</MenuItem>
    <MenuItem value="Desktop">{t("desktop")}</MenuItem>
    <MenuItem value="Tablet">{t("tablet")}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>{t("country")}</InputLabel>
          <Select
            value={country}
            label={t("country")}
            onChange={(e) => {
              setCountry(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">{t("all")}</MenuItem>
            <MenuItem value="India">{t("india")}</MenuItem>
<MenuItem value="USA">{t("usa")}</MenuItem>
<MenuItem value="Canada">{t("canada")}</MenuItem>
<MenuItem value="UK">{t("uk")}</MenuItem>
<MenuItem value="Germany">{t("germany")}</MenuItem>

          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{t("event")}</InputLabel>
          <Select
            value={eventType}
            label={t("event")}
            onChange={(e) => {
              setEventType(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">{t("all")}</MenuItem>
             <MenuItem value="page_visit">{t("pageVisit")}</MenuItem>
    <MenuItem value="purchase">{t("purchase")}</MenuItem>
    <MenuItem value="add_to_cart">{t("addToCart")}</MenuItem>
    <MenuItem value="search">{t("searchEvent")}</MenuItem>
    <MenuItem value="checkout">{t("checkout")}</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Date range selector */}
      <Box mb={3}>
        <DateRangeSelector
          range={range}
          onChange={(r) => {
            setRange(r);
            setPage(0);
          }}
        />
      </Box>
      
      {/* KPI + mini charts */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        <Card sx={{ flex: 1, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
               {t("totalEvents")}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {metrics?.totalEvents ?? "-"}
            </Typography>
            <Box sx={{ height: 120, mt: 1 }}>
              <Line data={pageVisitsData} options={baseChartOptions} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
               {t("purchases")}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {metrics?.purchases ?? "-"}
            </Typography>
            <Box sx={{ height: 120, mt: 1 }}>
              <Line data={purchasesData} options={baseChartOptions} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              {t("timeSpentSec")}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {metrics?.totalTimeSec ?? "-"}
            </Typography>
            <Box sx={{ height: 120, mt: 1 }}>
              <Line data={timeSpentData} options={baseChartOptions} />
            </Box>
          </CardContent>
        </Card>
      </Stack>

     

      {/* Users table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box py={6} display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ maxHeight: 570 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("user")}</TableCell>
                      <TableCell>{t("device")}</TableCell>
                      <TableCell>{t("country")}</TableCell>
                      <TableCell align="right">{t("pages")}</TableCell>
                      <TableCell align="right">{t("purchases")}</TableCell>
                      <TableCell align="right">{t("timeSec")}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {users.map((u) => (
                      <TableRow hover key={u.userId}>
                        <TableCell>
                          <strong>{u.name}</strong>
                          <br />
                          <span style={{ color: "gray", fontSize: 12 }}>{u.email}</span>
                        </TableCell>
                        <TableCell>{u.device}</TableCell>
                        <TableCell>{u.country}</TableCell>
                        <TableCell align="right">{u.pagesVisited ?? 0}</TableCell>
                        <TableCell align="right">{u.purchases ?? 0}</TableCell>
                        <TableCell align="right">{u.timeSpent ?? 0}</TableCell>
                        <TableCell>
                          <Button size="small" variant="contained" onClick={() => navigate(`/app/user/${u.userId}`)}>
                          {t("viewJourney")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={totalUsers}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 20, 50]}
                labelRowsPerPage={t("rowsPerPage")}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
