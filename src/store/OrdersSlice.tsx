import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RentalOrderInfo } from '../types/order';

interface ExpiredRentalOrdersState {
  data: RentalOrderInfo[];
  tablePage: number;
}

const initialState: ExpiredRentalOrdersState = {
  data: [],
  tablePage: 0,
};

export const rentalOrdersSlice = createSlice({
  name: 'expiredRentalOrders',
  initialState,
  reducers: {
    setExpiredRentalOrders(state, action: PayloadAction<RentalOrderInfo[]>) {
      state.data = action.payload;
    },
    clearExpiredRentalOrders(state) {
      state.data = [];
    },
    setRentalOrderTablePage(state, action) {
      state.tablePage = action.payload;
    },
  },
});

export const { setExpiredRentalOrders, clearExpiredRentalOrders, setRentalOrderTablePage } =
  rentalOrdersSlice.actions;

export default rentalOrdersSlice.reducer;
