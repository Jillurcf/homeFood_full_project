import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";
import type { Food } from "@/src/types/food";
import { API_ORIGIN, mapFood, mapFoodList } from "./mapFood";
import type { RawFood } from "./mapFood";
import { TOKEN_KEY } from "@/src/store/authSlice";
import type { RootState } from "@/src/store";

const API_BASE = `${API_ORIGIN}/api`;

const DEFAULT_LIST_LIMIT = 50;

export interface FoodsQuery {
  search?: string;
  category?: string;
  area?: string;
  limit?: number;
  page?: number;
}

export type FoodAvailability = "available" | "low" | "sold_out";

export interface FoodPayload {
  name: string;
  description: string;
  price: number;
  category: string;
  perUnit: string;
  prepTime: number;
  maxOrdersPerDay: number;
  availability: FoodAvailability;
  imageUrl?: string;
  area: string;
  dietaryTags?: string[];
  deliveryFee?: number;
}

interface FoodsResponse {
  success: boolean;
  data: { foods: RawFood[]; total: number };
}

interface FoodResponse {
  success: boolean;
  data: RawFood;
}

interface MyFoodsResponse {
  success: boolean;
  data: RawFood[];
}

const buildListParams = (params?: FoodsQuery | void) => {
  const query = (params ?? {}) as FoodsQuery;
  const cleaned: Record<string, string | number> = {
    limit: query.limit ?? DEFAULT_LIST_LIMIT,
  };

  if (query.search?.trim()) cleaned.search = query.search.trim();
  if (query.category) cleaned.category = query.category;
  if (query.area) cleaned.area = query.area;
  if (query.page) cleaned.page = query.page;

  return cleaned;
};

const foodsBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  prepareHeaders: async (headers, { getState }) => {
    const state = getState() as RootState;
    const token =
      state.auth.token ?? (await SecureStore.getItemAsync(TOKEN_KEY));
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const foodsApi = createApi({
  reducerPath: "foodsApi",
  baseQuery: foodsBaseQuery,
  tagTypes: ["Foods"],
  endpoints: (builder) => ({
    getFoods: builder.query<Food[], FoodsQuery | void>({
      query: (params) => ({ url: "/foods", params: buildListParams(params) }),
      transformResponse: (response: FoodsResponse) =>
        mapFoodList(response.data.foods),
      providesTags: ["Foods"],
    }),
    getFoodById: builder.query<Food, string>({
      query: (id) => `/foods/${id}`,
      transformResponse: (response: FoodResponse) => mapFood(response.data),
      providesTags: ["Foods"],
    }),
    getMyFoods: builder.query<Food[], void>({
      query: () => "/foods/seller/mine",
      transformResponse: (response: MyFoodsResponse) =>
        mapFoodList(response.data),
      providesTags: ["Foods"],
    }),
    createFood: builder.mutation<Food, FoodPayload>({
      query: (body) => ({ url: "/foods", method: "POST", body }),
      transformResponse: (response: FoodResponse) => mapFood(response.data),
      invalidatesTags: ["Foods"],
    }),
    updateFood: builder.mutation<Food, { id: string; body: Partial<FoodPayload> }>({
      query: ({ id, body }) => ({
        url: `/foods/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: FoodResponse) => mapFood(response.data),
      invalidatesTags: ["Foods"],
    }),
    deleteFood: builder.mutation<Food, string>({
      query: (id) => ({ url: `/foods/${id}`, method: "DELETE" }),
      transformResponse: (response: FoodResponse) => mapFood(response.data),
      invalidatesTags: ["Foods"],
    }),
  }),
});

export const {
  useGetFoodsQuery,
  useGetFoodByIdQuery,
  useGetMyFoodsQuery,
  useCreateFoodMutation,
  useUpdateFoodMutation,
  useDeleteFoodMutation,
} = foodsApi;
