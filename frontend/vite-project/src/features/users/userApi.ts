// src/features/users/userApi.ts
import { api } from "../../app/api";

export const userApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUserJourney: build.query<any, { id: string; start?: string; end?: string }>({
      query: ({ id, start, end }) => ({ url: `/user/${id}/journey`, params: { start, end } }),
      providesTags: (result, error, arg) => [{ type: "UserJourney", id: arg.id }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetUserJourneyQuery } = userApi;
