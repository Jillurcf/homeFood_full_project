import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";
import { API_ORIGIN } from "./mapFood";
import { TOKEN_KEY } from "@/src/store/authSlice";
import type { RootState } from "@/src/store";
import type { StatusPillVariant } from "@/src/components/ui";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "ON_THE_WAY"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface DeliveryAddress {
  label?: string;
  addressLine?: string;
  area?: string;
  city?: string;
  phone?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  note?: string;
  deliveryAddress?: DeliveryAddress;
  paymentMethod: "cod" | "bkash" | "nagad" | "card";
  status: OrderStatus;
  createdAt: string;
}

interface RawOrder {
  _id: string;
  items?: Partial<OrderItem>[];
  totalAmount?: number;
  note?: string;
  deliveryAddress?: DeliveryAddress;
  paymentMethod?: Order["paymentMethod"];
  status?: OrderStatus;
  createdAt?: string;
}

export const STATUS_META: Record<
  OrderStatus,
  { label: string; variant: StatusPillVariant }
> = {
  PENDING: { label: "New", variant: "amber" },
  CONFIRMED: { label: "Confirmed", variant: "primary" },
  PREPARING: { label: "Preparing", variant: "primary" },
  ON_THE_WAY: { label: "On the way", variant: "primary" },
  DELIVERED: { label: "Delivered", variant: "emerald" },
  CANCELLED: { label: "Cancelled", variant: "red" },
};

export const ORDER_FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "preparing", label: "Preparing" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export type OrderFilterValue = (typeof ORDER_FILTERS)[number]["value"];

const FILTER_STATUSES: Record<Exclude<OrderFilterValue, "all">, OrderStatus[]> = {
  new: ["PENDING"],
  preparing: ["CONFIRMED", "PREPARING", "ON_THE_WAY"],
  delivered: ["DELIVERED"],
  cancelled: ["CANCELLED"],
};

export function matchesOrderFilter(order: Order, filter: OrderFilterValue): boolean {
  if (filter === "all") return true;
  return FILTER_STATUSES[filter].includes(order.status);
}

export function shortOrderId(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`;
}

export function formatOrderDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function orderItemCount(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

const PAYMENT_LABELS: Record<Order["paymentMethod"], string> = {
  cod: "Cash on delivery",
  bkash: "bKash",
  nagad: "Nagad",
  card: "Card",
};

export function paymentMethodLabel(method: Order["paymentMethod"]): string {
  return PAYMENT_LABELS[method] ?? "Cash on delivery";
}

function mapOrder(raw: RawOrder): Order {
  return {
    id: raw._id,
    items: (raw.items ?? []).map((item) => ({
      foodId: item.foodId ?? "",
      name: item.name ?? "Untitled item",
      price: item.price ?? 0,
      quantity: item.quantity ?? 1,
    })),
    totalAmount: raw.totalAmount ?? 0,
    note: raw.note,
    deliveryAddress: raw.deliveryAddress,
    paymentMethod: raw.paymentMethod ?? "cod",
    status: raw.status ?? "PENDING",
    createdAt: raw.createdAt ?? "",
  };
}

const ordersBaseQuery = fetchBaseQuery({
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
});

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: ordersBaseQuery,
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    getMyOrders: builder.query<Order[], void>({
      query: () => "/orders/my-orders",
      transformResponse: (response: { success: boolean; data?: RawOrder[] }) =>
        (response.data ?? []).map(mapOrder),
      providesTags: ["Orders"],
    }),
    getSellerOrders: builder.query<Order[], void>({
      query: () => "/orders/seller-orders",
      transformResponse: (response: { success: boolean; data?: RawOrder[] }) =>
        (response.data ?? []).map(mapOrder),
      providesTags: ["Orders"],
    }),
    getOrderById: builder.query<Order, string>({
      query: (orderId) => `/orders/${orderId}`,
      transformResponse: (response: { success: boolean; data: RawOrder }) =>
        mapOrder(response.data),
    }),
    updateOrderStatus: builder.mutation<
      Order,
      { orderId: string; status: OrderStatus }
    >({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: { success: boolean; data: RawOrder }) =>
        mapOrder(response.data),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetMyOrdersQuery,
  useGetSellerOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} = ordersApi;
