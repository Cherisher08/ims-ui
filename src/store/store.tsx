import { configureStore } from "@reduxjs/toolkit";
// Or from '@reduxjs/toolkit/query/react'
import { setupListeners } from "@reduxjs/toolkit/query";
import { rootApi } from "../services/ApiService";
import userReducer from "./UserSlice";
import rentalOrdersReducer from "./OrdersSlice";

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    user: userReducer,
    rentalOrder: rentalOrdersReducer,
    [rootApi.reducerPath]: rootApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(rootApi.middleware),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
