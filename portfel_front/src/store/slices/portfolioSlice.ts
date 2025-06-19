// portfolioSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { portfolioApi } from '../../api/portfolio';
import { apiClient } from '../../api/index';
import { Portfolio, PortfolioAsset, Asset } from '../../types/portfolio';

interface TinkoffPositionBE {
    figi: string;
    instrument_type: string;
    quantity: string | null;
    average_position_price: string | null;
    average_position_price_currency: string | null;
    expected_yield: string | null;
    current_nkd: string | null;
    current_nkd_currency: string | null;
    current_price: string | null;
    current_price_currency: string | null;
    quantity_lots: string | null;
}

interface TinkoffPortfolioDataBE {
    account_id: string;
    total_amount_shares: string | null;
    total_amount_bonds: string | null;
    total_amount_etf: string | null;
    total_amount_currencies: string | null;
    total_amount_futures: string | null;
    expected_yield: string | null;
    total_amount_portfolio: string | null;
    positions: TinkoffPositionBE[];
}

interface PortfolioState {
    portfolios: Portfolio[];
    currentPortfolio: Portfolio | null;
    allAssets: Asset[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    assetDeletionStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    assetDeletionError: string | null;
    tinkoffPortfolioData: TinkoffPortfolioDataBE | null;
    tinkoffStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    tinkoffError: string | null;
}

const initialState: PortfolioState = {
    portfolios: [],
    currentPortfolio: null,
    allAssets: [],
    status: 'idle',
    assetDeletionStatus: 'idle',
    error: null,
    assetDeletionError: null,
    tinkoffPortfolioData: null,
    tinkoffStatus: 'idle',
    tinkoffError: null,
};

export const fetchPortfolios = createAsyncThunk(
    'portfolio/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await portfolioApi.getPortfolios();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch portfolios';
            return rejectWithValue(message);
        }
    }
);

export const deletePortfolio = createAsyncThunk(
    'portfolio/delete',
    async (portfolioId: number, { rejectWithValue }) => {
        try {
            await portfolioApi.deletePortfolio(portfolioId);
            return portfolioId;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete portfolio';
            return rejectWithValue(message);
        }
    }
);

export const updatePortfolio = createAsyncThunk(
    'portfolio/update',
    async (portfolio: Portfolio, { rejectWithValue }) => {
        try {
            const response = await portfolioApi.updatePortfolio(portfolio);
            return response;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update portfolio';
            return rejectWithValue(message);
        }
    }
);

export const fetchPortfolioDetails = createAsyncThunk(
    'portfolio/fetchDetails',
    async (portfolioId: number, { rejectWithValue }) => {
        try {
            const response = await apiClient.get<Portfolio>(`/portfolios/${portfolioId}/`);
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Failed to fetch portfolio details';
            return rejectWithValue(message);
        }
    }
);

export const createNewPortfolio = createAsyncThunk(
    'portfolio/create',
    async (name: string, { rejectWithValue }) => {
        try {
            return await portfolioApi.createPortfolio(name);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create portfolio';
            return rejectWithValue(message);
        }
    }
);

export const fetchAllAssets = createAsyncThunk(
    'portfolio/fetchAllAssets',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get<Asset[]>('/assets/');
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Failed to fetch assets';
            return rejectWithValue(message);
        }
    }
);

export const addAssetToPortfolio = createAsyncThunk(
    'portfolio/addAsset',
    async ({ portfolioId, assetId, quantity, price }:
               { portfolioId: number, assetId: number, quantity: number, price: number },
           { rejectWithValue }
    ) => {
        try {
            const response = await apiClient.post<PortfolioAsset>(`/portfolio-assets/`, {
                portfolio: portfolioId,
                asset_id: assetId,
                quantity,
                price: price
            });
            return response.data;
        } catch (error: any) {
            const backendErrors = error.response?.data;
            let message = 'Failed to add asset to portfolio';
            if (typeof backendErrors === 'object' && backendErrors !== null) {
                message = Object.values(backendErrors).flat().join(' ') || message;
            } else if (typeof backendErrors === 'string') {
                message = backendErrors;
            } else if (error.message) {
                message = error.message;
            }
            console.error("Add Asset Error Response:", error.response);
            return rejectWithValue(message);
        }
    }
);

export const deleteAssetFromPortfolio = createAsyncThunk(
    'portfolio/deleteAsset',
    async (portfolioAssetId: number, { rejectWithValue }) => {
        try {
            await portfolioApi.deletePortfolioAsset(portfolioAssetId);
            return portfolioAssetId;
        } catch (error: any) {
            const backendErrors = error.response?.data;
            let message = 'Failed to delete asset from portfolio';
            if (typeof backendErrors === 'object' && backendErrors !== null) {
                message = Object.values(backendErrors).flat().join(' ') || message;
            } else if (typeof backendErrors === 'string') {
                message = backendErrors;
            } else if (error.message) {
                message = error.message;
            }
            console.error("Delete Asset Error Response:", error.response);
            return rejectWithValue(message);
        }
    }
);

export const fetchTinkoffPortfolio = createAsyncThunk<
    TinkoffPortfolioDataBE,
    string,
    { rejectValue: string }
    >(
    'portfolio/fetchTinkoff',
    async (tinkoffToken, { rejectWithValue }) => {
        try {
            const response = await apiClient.post<TinkoffPortfolioDataBE>(`/tinkoff/portfolio/`, {
                tinkoff_token: tinkoffToken
            });
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.error
                || error.message
                || 'Failed to fetch Tinkoff portfolio data from server';
            console.error("Fetch Tinkoff Portfolio Error:", error.response?.data || error);
            return rejectWithValue(message);
        }
    }
);


const portfolioSlice = createSlice({
    name: 'portfolio',
    initialState,
    reducers: {
        setCurrentPortfolio: (state, action) => {
            state.currentPortfolio = action.payload;
        },
        clearPortfolioError: (state) => {
            state.error = null;
            state.assetDeletionError = null;
        },
        clearTinkoffData: (state) => {
            state.tinkoffPortfolioData = null;
            state.tinkoffStatus = 'idle';
            state.tinkoffError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPortfolios.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPortfolios.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.portfolios = action.payload;
            })
            .addCase(fetchPortfolios.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(createNewPortfolio.fulfilled, (state, action) => {
                state.portfolios.push(action.payload);
                state.status = 'succeeded';
            })
            .addCase(createNewPortfolio.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(deletePortfolio.fulfilled, (state, action) => {
                state.portfolios = state.portfolios.filter(
                    p => p.Port_ID !== action.payload
                );
                if (state.currentPortfolio?.Port_ID === action.payload) {
                    state.currentPortfolio = null;
                }
                state.status = 'succeeded';
            })
            .addCase(deletePortfolio.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(updatePortfolio.fulfilled, (state, action) => {
                const index = state.portfolios.findIndex(
                    p => p.Port_ID === action.payload.Port_ID
                );
                if (index !== -1) {
                    state.portfolios[index] = action.payload;
                }
                if (state.currentPortfolio?.Port_ID === action.payload.Port_ID) {
                    state.currentPortfolio = action.payload;
                }
                state.status = 'succeeded';
            })
            .addCase(updatePortfolio.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(fetchPortfolioDetails.pending, (state) => {
                state.status = 'loading';
                state.error = null;
                state.assetDeletionError = null;
            })
            .addCase(fetchPortfolioDetails.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentPortfolio = action.payload;
            })
            .addCase(fetchPortfolioDetails.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
                state.currentPortfolio = null;
            })
            .addCase(fetchAllAssets.pending, (state) => {
            })
            .addCase(fetchAllAssets.fulfilled, (state, action) => {
                state.allAssets = action.payload;
            })
            .addCase(fetchAllAssets.rejected, (state, action) => {
                console.error("Failed to fetch all assets:", action.payload);
            })
            .addCase(addAssetToPortfolio.pending, (state) => {
                state.status = 'loading';
                state.error = null;
                state.assetDeletionError = null;
            })
            .addCase(addAssetToPortfolio.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
            .addCase(addAssetToPortfolio.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(deleteAssetFromPortfolio.pending, (state) => {
                state.assetDeletionStatus = 'loading';
                state.assetDeletionError = null;
            })
            .addCase(deleteAssetFromPortfolio.fulfilled, (state, action) => {
                state.assetDeletionStatus = 'succeeded';
            })
            .addCase(deleteAssetFromPortfolio.rejected, (state, action) => {
                state.assetDeletionStatus = 'failed';
                state.assetDeletionError = action.payload as string;
            })
            .addCase(fetchTinkoffPortfolio.pending, (state) => {
                state.tinkoffStatus = 'loading';
                state.tinkoffError = null;
                state.tinkoffPortfolioData = null;
            })
            .addCase(fetchTinkoffPortfolio.fulfilled, (state, action) => {
                state.tinkoffStatus = 'succeeded';
                state.tinkoffPortfolioData = action.payload;
            })
            .addCase(fetchTinkoffPortfolio.rejected, (state, action) => {
                state.tinkoffStatus = 'failed';
                state.tinkoffError = action.payload as string;
            });
    },
});

export const { setCurrentPortfolio, clearPortfolioError, clearTinkoffData } = portfolioSlice.actions;
export default portfolioSlice.reducer;