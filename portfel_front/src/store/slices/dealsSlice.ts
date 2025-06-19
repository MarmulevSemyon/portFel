import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { dealsApi } from '../../api/deals';
import { Deal } from '../../types/portfolio';

interface DealsState {
    deals: Deal[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: DealsState = {
    deals: [],
    status: 'idle',
    error: null,
};

export const fetchPortfolioDeals = createAsyncThunk(
    'deals/fetchForPortfolio',
    async (portfolioId: number, { rejectWithValue }) => {
        try {
            return await dealsApi.getPortfolioDeals(portfolioId);
        } catch (error) {
            return rejectWithValue('Failed to fetch deals');
        }
    }
);

export const addNewDeal = createAsyncThunk(
    'deals/add',
    async (
        { portfolioId, dealData }: { portfolioId: number; dealData: Omit<Deal, 'Deal_ID'> },
        { rejectWithValue }
    ) => {
        try {
            return await dealsApi.createDeal(portfolioId, dealData);
        } catch (error) {
            return rejectWithValue('Failed to add deal');
        }
    }
);

const dealsSlice = createSlice({
    name: 'deals',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPortfolioDeals.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPortfolioDeals.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.deals = action.payload;
            })
            .addCase(addNewDeal.fulfilled, (state, action) => {
                state.deals.push(action.payload);
            });
    },
});

export default dealsSlice.reducer;