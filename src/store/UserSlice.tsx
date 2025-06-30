import { createSlice } from "@reduxjs/toolkit";
import { UserRole } from "../types/user";

export interface UserState {
  email: string;
  loggedTime: string;
  id: string;
  role: UserRole;
  name: string;
}

const initialState: UserState = {
  email: "",
  id: "",
  role: UserRole.User,
  loggedTime: "",
  name: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (
      state,
      payload: {
        payload: Partial<UserState>;
        type: string;
      }
    ) => {
      return (state = {
        ...state,
        ...payload.payload,
      });
    },
    clearUser: (state) => {
      return (state = {
        ...state,
        ...initialState,
      });
    },
  },
});

export const { updateUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
