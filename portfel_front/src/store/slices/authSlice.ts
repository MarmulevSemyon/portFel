import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../api/auth';
import { User } from '../../types/portfolio';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    status: 'idle',
    error: null,
};

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: { username: string; password: string }, { rejectWithValue }) => {
        try {
            const { access, refresh } = await authApi.login(credentials);
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            const user = await authApi.getMe();
            return { user, accessToken: access };
        } catch (error) {
            return rejectWithValue('Invalid credentials');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData: { username: string; email: string; password: string }, { rejectWithValue }) => {
        try {
            await authApi.register(userData);
            return null; // Registration doesn't return user data
        } catch (error) {
            return rejectWithValue('Registration failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            state.user = null;
            state.accessToken = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(registerUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;