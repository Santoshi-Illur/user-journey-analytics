// src/features/funnel/funnelApi.ts
import { api } from "../../app/api";

export const funnelApi = api.injectEndpoints({
  endpoints: (build) => ({
    getFunnel: build.query<any, { start?: string; end?: string }>({
      query: (params) => ({ url: "/funnel", params }),
      providesTags: [{ type: "Funnel", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFunnelQuery } = funnelApi;
