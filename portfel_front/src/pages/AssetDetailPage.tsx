import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAssetDetails, clearCurrentAsset } from '../store/slices/assetsSlice';
import {
    Container,
    Paper,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Button,
    Box // Import Box for layout
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import icon

const formatNumber = (value: number | string | null | undefined, decimals = 2, prefix = '', suffix = '') => {
    if (value === null || value === undefined) {
        return 'N/A';
    }

    const num = Number(value);

    if (isNaN(num)) {
        return 'N/A';
    }

    return `${prefix}${num.toFixed(decimals)}${suffix}`;
};

const AssetDetailPage = () => {
    const { assetId } = useParams<{ assetId: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate(); // Hook for navigation
    const { currentAsset, status, error } = useAppSelector((state) => state.assets);

    useEffect(() => {
        if (assetId) {
            const numericAssetId = parseInt(assetId, 10);
            if (!isNaN(numericAssetId)) {
                dispatch(fetchAssetDetails(numericAssetId));
            } else {
                console.error("Invalid assetId format:", assetId);
            }
        }
        return () => {
            dispatch(clearCurrentAsset());
        };
    }, [dispatch, assetId]);

    if (status === 'loading') {
        return (
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)} // Navigate back
                    sx={{ mb: 2 }}
                >
                    Back
                </Button>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!currentAsset) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)} // Navigate back
                    sx={{ mb: 2 }}
                >
                    Back
                </Button>
                <Alert severity="info">Asset not found</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)} // Navigate back
                    sx={{ mr: 2 }} // Add some margin to the right
                >
                    Back
                </Button>
                <Typography variant="h4" component="h1">
                    {currentAsset.ticker} - {currentAsset.company}
                </Typography>
            </Box>
            <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TableContainer component={Paper} elevation={2}>
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell variant="head" sx={{ fontWeight: 'bold' }}>ISIN</TableCell>
                                        <TableCell>{currentAsset.ISIN}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" sx={{ fontWeight: 'bold' }}>Country</TableCell>
                                        <TableCell>{currentAsset.country}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" sx={{ fontWeight: 'bold' }}>Region</TableCell>
                                        <TableCell>{currentAsset.region}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" sx={{ fontWeight: 'bold' }}>Exchange</TableCell>
                                        <TableCell>{currentAsset.exchange}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TableContainer component={Paper} elevation={2}>
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell variant="head" sx={{ fontWeight: 'bold' }}>Current Price</TableCell>
                                        <TableCell>{formatNumber(currentAsset.current_price, 2, '$')}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" sx={{ fontWeight: 'bold' }}>Currency</TableCell>
                                        <TableCell>{currentAsset.currency}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" sx={{ fontWeight: 'bold' }}>Dividend Yield</TableCell>
                                        <TableCell>{formatNumber(currentAsset.dividend_yield, 2, '', '%')}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" sx={{ fontWeight: 'bold' }}>PE Ratio</TableCell>
                                        <TableCell>{formatNumber(currentAsset.pe_ratio, 2)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }} elevation={2}>
                            <Typography variant="h6" gutterBottom>Description</Typography>
                            <Typography>
                                {currentAsset.description || 'No description available'}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default AssetDetailPage;