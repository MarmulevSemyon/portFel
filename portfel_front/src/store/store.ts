import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import portfolioReducer from './slices/portfolioSlice';
import assetsReducer from './slices/assetsSlice';
import dealsReducer from './slices/dealsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        portfolio: portfolioReducer,
        assets: assetsReducer,
        deals: dealsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;