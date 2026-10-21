import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";
import { API_ORIGIN } from "./mapFood";
import { TOKEN_KEY } from "@/src/store/authSlice";
import type { RootState } from "@/src/store";

export type KitchenType = "home" | "shared" | "home_catering";

export interface ShopProfile {
  id: string;
  fullName: string;
  photoUrl?: string;
  phone: string;
  email: string;
  shopName: string;
  kitchenType: KitchenType;
  area: string;
  address: string;
  areas: string[];
  openHours?: string;
  bio?: string;
  nidNumber?: string;
  verified: boolean;
}

export type ShopPayload = Omit<ShopProfile, "id" | "verified">;

export interface PopularFood {
  foodId: string;
  name: string;
  qty: number;
}

export interface ShopStats {
  todayOrders: number;
  pending: number;
  completed: number;
  todayEarnings: number;
  totalEarnings: number;
  avgRating: number;
  popularFoods: PopularFood[];
}

interface RawShop extends Omit<ShopProfile, "id"> {
  _id: string;
}

interface ShopResponse {
  success: boolean;
  data: RawShop;
}

function mapShop(raw: RawShop): ShopProfile {
  const { _id, ...rest } = raw;
  return { ...rest, id: _id };
}

export const shopsApi = createApi({
  reducerPath: "shopsApi",
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
  tagTypes: ["Shop", "ShopStats"],
  endpoints: (builder) => ({
    getMyShop: builder.query<ShopProfile, void>({
      query: () => "/shops/me",
      transformResponse: (response: ShopResponse) => mapShop(response.data),
      providesTags: ["Shop"],
    }),
    getMyStats: builder.query<ShopStats, void>({
      query: () => "/shops/me/stats",
      transformResponse: (response: { success: boolean; data: ShopStats }) =>
        response.data,
      providesTags: ["ShopStats"],
    }),
    saveShop: builder.mutation<ShopProfile, ShopPayload>({
      query: (body) => ({ url: "/shops/me", method: "POST", body }),
      transformResponse: (response: ShopResponse) => mapShop(response.data),
      invalidatesTags: ["Shop"],
    }),
  }),
});

export const { useGetMyShopQuery, useGetMyStatsQuery, useSaveShopMutation } =
  shopsApi;
