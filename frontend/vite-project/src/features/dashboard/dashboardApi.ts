// src/features/dashboard/dashboardApi.ts
import { api } from "../../app/api";

export const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<any, {
      start?: string;
      end?: string;
      device?: string;
      country?: string;
      eventType?: string;
      q?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({ url: "/dashboard", params }),
      providesTags: (result) =>
        result ? [{ type: "Dashboard", id: "LIST" }] : [{ type: "Dashboard", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardQuery } = dashboardApi;
