import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/entities/domain/user/model/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<User> & { id: string }>) => {
      state.user = {
        id: action.payload.id,
        email: action.payload.email ?? '',
        username: action.payload.username,
        avatar_url: action.payload.avatar_url,
        discord_id: action.payload.discord_id,
        is_active: action.payload.is_active ?? true,
      };
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
