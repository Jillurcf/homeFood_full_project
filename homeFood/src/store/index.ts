import { configureStore } from "@reduxjs/toolkit";
import { foodsApi } from "@/src/api/foods";
import { ordersApi } from "@/src/api/orders";
import { reviewsApi } from "@/src/api/reviews";
import { shopsApi } from "@/src/api/shops";
import authReducer from "./authSlice";
import favoritesReducer from "./favoritesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    favorites: favoritesReducer,
    [foodsApi.reducerPath]: foodsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [shopsApi.reducerPath]: shopsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(foodsApi.middleware, ordersApi.middleware)
      .concat(reviewsApi.middleware, shopsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
