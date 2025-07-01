import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RentalOrderInfo } from "../types/order";

interface ExpiredRentalOrdersState {
  data: RentalOrderInfo[];
}

const initialState: ExpiredRentalOrdersState = {
  data: [],
};

export const rentalOrdersSlice = createSlice({
  name: "expiredRentalOrders",
  initialState,
  reducers: {
    setExpiredRentalOrders(state, action: PayloadAction<RentalOrderInfo[]>) {
      state.data = action.payload;
    },
    clearExpiredRentalOrders(state) {
      state.data = [];
    },
  },
});

export const { setExpiredRentalOrders, clearExpiredRentalOrders } =
  rentalOrdersSlice.actions;

export default rentalOrdersSlice.reducer;
