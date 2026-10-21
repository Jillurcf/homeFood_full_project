import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface FavoritesState {
  ids: string[];
}

const initialState: FavoritesState = { ids: [] };

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<string>) {
      const id = action.payload;
      const index = state.ids.indexOf(id);
      if (index >= 0) state.ids.splice(index, 1);
      else state.ids.push(id);
    },
    clearFavorites(state) {
      state.ids = [];
    },
  },
});

export const { toggleFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
