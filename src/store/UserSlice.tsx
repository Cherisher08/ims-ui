import { createSlice } from '@reduxjs/toolkit';
import { UserRole, Branch } from '../types/user';

export interface UserState {
  email: string;
  loggedTime: string;
  id: string;
  role: UserRole;
  name: string;
  branch: Branch;
}

const initialState: UserState = {
  email: '',
  id: '',
  role: UserRole.User,
  loggedTime: '',
  name: '',
  branch: Branch.PADUR,
};

export const userSlice = createSlice({
  name: 'user',
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
