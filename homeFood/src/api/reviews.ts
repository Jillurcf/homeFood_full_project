import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";
import { API_ORIGIN } from "./mapFood";
import { TOKEN_KEY } from "@/src/store/authSlice";
import type { RootState } from "@/src/store";

export interface SellerReview {
  id: string;
  foodId: string;
  foodName: string;
  authorName: string;
  area: string;
  rating: number;
  text: string;
  sellerReply?: string;
  repliedAt?: string;
  createdAt: string;
}

interface RawReview {
  _id: string;
  foodId: string | { _id: string };
  foodName?: string;
  authorName?: string;
  area?: string;
  rating?: number;
  text?: string;
  sellerReply?: string;
  repliedAt?: string;
  createdAt?: string;
}

function mapReview(raw: RawReview): SellerReview {
  return {
    id: raw._id,
    foodId:
      typeof raw.foodId === "string" ? raw.foodId : raw.foodId?._id ?? "",
    foodName: raw.foodName ?? "Dish",
    authorName: raw.authorName || "Verified buyer",
    area: raw.area || "",
    rating: raw.rating ?? 0,
    text: raw.text || "",
    sellerReply: raw.sellerReply,
    repliedAt: raw.repliedAt,
    createdAt: raw.createdAt ?? "",
  };
}

export const reviewsApi = createApi({
  reducerPath: "reviewsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_ORIGIN}/api`,
    prepareHeaders: async (headers, { getState }) => {
      const state = getState() as RootState;
      const token =
        state.auth.token ?? (await SecureStore.getItemAsync(TOKEN_KEY));
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["SellerReviews"],
  endpoints: (builder) => ({
    getSellerReviews: builder.query<SellerReview[], void>({
      query: () => "/reviews/seller",
      transformResponse: (response: {
        success: boolean;
        data?: RawReview[];
      }) => (response.data ?? []).map(mapReview),
      providesTags: ["SellerReviews"],
    }),
    replyToReview: builder.mutation<
      SellerReview,
      { id: string; reply: string }
    >({
      query: ({ id, reply }) => ({
        url: `/reviews/${id}/reply`,
        method: "POST",
        body: { reply },
      }),
      transformResponse: (response: { success: boolean; data: RawReview }) =>
        mapReview(response.data),
      invalidatesTags: ["SellerReviews"],
    }),
  }),
});

export const { useGetSellerReviewsQuery, useReplyToReviewMutation } =
  reviewsApi;
