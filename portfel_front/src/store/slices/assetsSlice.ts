import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {assetsApi} from '../../api/assets';
import {Asset} from '../../types/portfolio';

interface AssetsState {
    assets: Asset[];
    currentAsset: Asset | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    searchQuery: string;
}

const initialState: AssetsState = {
    assets: [],
    currentAsset: null,
    status: 'idle',
    error: null,
    searchQuery: '',
};

export const fetchAllAssets = createAsyncThunk(
    'assets/fetchAll',
    async (_, {rejectWithValue}) => {
        try {
            return await assetsApi.getAllAssets();
        } catch (error) {
            return rejectWithValue('Failed to fetch assets');
        }
    }
);

export const searchAssets = createAsyncThunk(
    'assets/search',
    async (query: string, {rejectWithValue}) => {
        try {
            return await assetsApi.searchAssets(query);
        } catch (error) {
            return rejectWithValue('Failed to search assets');
        }
    }
);

export const fetchAssetDetails = createAsyncThunk(
    'assets/fetchDetails',
    async (assetId: number, {rejectWithValue}) => {
        try {
            return await assetsApi.getAssetDetails(assetId);
        } catch (error) {
            return rejectWithValue('Failed to fetch asset details');
        }
    }
);

const assetsSlice = createSlice({
    name: 'assets',
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        clearCurrentAsset: (state) => {
            state.currentAsset = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllAssets.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllAssets.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.assets = action.payload;
            })
            .addCase(searchAssets.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.assets = action.payload;
            })
            .addCase(fetchAssetDetails.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAssetDetails.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentAsset = action.payload;
            }).addCase(fetchAssetDetails.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload as string;
        })
    },
});

export const {setSearchQuery, clearCurrentAsset} = assetsSlice.actions;
export default assetsSlice.reducer;