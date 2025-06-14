import { createSlice } from "@reduxjs/toolkit";

export interface UserState {
  email: string;
  loggedTime: string;
}

const initialState: UserState = {
  email: "",
  loggedTime: "",
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
  },
});

export const { updateUser } = userSlice.actions;

export default userSlice.reducer;
