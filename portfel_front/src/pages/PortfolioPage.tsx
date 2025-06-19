import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
    fetchPortfolioDetails,
    addAssetToPortfolio,
    fetchAllAssets,
    clearPortfolioError,
    deleteAssetFromPortfolio,
    fetchTinkoffPortfolio,
    clearTinkoffData
} from '../store/slices/portfolioSlice';
import {fetchPortfolioDeals, addNewDeal} from '../store/slices/dealsSlice';
import {Asset, PortfolioAsset, Deal} from '../types/portfolio';
import {
    Button,
    CircularProgress,
    Container,
    Grid,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Autocomplete,
    Box,
    Alert,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    DialogContentText,
    Link
} from '@mui/material';
import {Add, Visibility, Delete as DeleteIcon} from '@mui/icons-material';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFnsV3';
import {LocalizationProvider, DateTimePicker} from '@mui/x-date-pickers';
import PortfolioChart from '../components/PortfolioChart';
import {format} from 'date-fns';

const formatNumber = (value: string | number | null | undefined, decimals: number = 2): string => {
    if (value == null) return 'N/A';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'N/A';
    return num.toFixed(decimals);
};

const formatDecimalString = (value: string | null | undefined, decimals: number = 2): string => {
    if (value == null) return 'N/A';
    try {
        const num = parseFloat(value);
        if (isNaN(num)) return 'N/A';
        return num.toFixed(decimals);
    } catch {
        return 'N/A';
    }
};

const PortfolioDetail = () => {
    const {id} = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const {
        currentPortfolio,
        allAssets,
        status: portfolioStatus,
        assetDeletionStatus,
        error: portfolioError,
        assetDeletionError,
        tinkoffPortfolioData,
        tinkoffStatus,
        tinkoffError
    } = useAppSelector((state) => state.portfolio);

    const {
        deals,
        status: dealsStatus,
        error: dealsError,
    } = useAppSelector((state) => state.deals);

    const [showAddAssetForm, setShowAddAssetForm] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [assetQuantity, setAssetQuantity] = useState('');
    const [assetPrice, setAssetPrice] = useState('');

    const [showAddDealForm, setShowAddDealForm] = useState(false);
    const [selectedDealAsset, setSelectedDealAsset] = useState<Asset | null>(null);
    const [dealType, setDealType] = useState<boolean | string>('');
    const [dealQuantity, setDealQuantity] = useState('');
    const [dealPrice, setDealPrice] = useState('');
    const [dealDate, setDealDate] = useState<Date | null>(new Date());
    const [dealCommission, setDealCommission] = useState('');
    const [dealTax, setDealTax] = useState('');

    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<PortfolioAsset | null>(null);
    const [tinkoffTokenInput, setTinkoffTokenInput] = useState('');

    useEffect(() => {
        dispatch(clearPortfolioError());
        if (id) {
            const portfolioId = Number(id);
            dispatch(fetchPortfolioDetails(portfolioId));
            dispatch(fetchAllAssets());
            dispatch(fetchPortfolioDeals(portfolioId));
        }
        return () => {
            dispatch(clearTinkoffData());
        };
    }, [dispatch, id]);

    const handleCloseAddAssetDialog = () => {
        setShowAddAssetForm(false);
        setSelectedAsset(null);
        setAssetQuantity('');
        setAssetPrice('');
    };

    const handleAddAssetSubmit = async () => {
        if (selectedAsset && assetQuantity && assetPrice && currentPortfolio) {
            const resultAction = await dispatch(addAssetToPortfolio({
                portfolioId: currentPortfolio.Port_ID,
                assetId: selectedAsset.Asset_ID,
                quantity: parseFloat(assetQuantity),
                price: parseFloat(assetPrice)
            }));
            if (addAssetToPortfolio.fulfilled.match(resultAction)) {
                handleCloseAddAssetDialog();
                if (id) {
                    dispatch(fetchPortfolioDetails(Number(id)));
                    dispatch(fetchPortfolioDeals(Number(id)));
                }
            } else {
                console.error("Failed to add asset:", resultAction.payload);
            }
        }
    };

    const handleCloseAddDealDialog = () => {
        setShowAddDealForm(false);
        setSelectedDealAsset(null);
        setDealType('');
        setDealQuantity('');
        setDealPrice('');
        setDealDate(new Date());
        setDealCommission('');
        setDealTax('');
    };

    const handleAddDealSubmit = async () => {
        if (selectedDealAsset && dealType !== '' && dealQuantity && dealPrice && dealDate && currentPortfolio) {
            const dealData: Omit<Deal, 'Deal_ID' | 'portfolio' | 'asset_ticker' | 'address' | 'status' | 'total'> & { asset: number; type: boolean } = {
                asset: selectedDealAsset.Asset_ID,
                type: dealType === 'buy',
                quantity: dealQuantity,
                price: dealPrice,
                commission: dealCommission || '0',
                tax: dealTax || '0',
                date: dealDate.toISOString(),
            };
            const resultAction = await dispatch(addNewDeal({
                portfolioId: currentPortfolio.Port_ID,
                dealData: dealData as any
            }));
            if (addNewDeal.fulfilled.match(resultAction)) {
                handleCloseAddDealDialog();
                if (id) {
                    dispatch(fetchPortfolioDetails(Number(id)));
                    dispatch(fetchPortfolioDeals(Number(id)));
                }
            } else {
                console.error("Failed to add deal:", resultAction.payload);
            }
        }
    };

    const handleDeleteDeal = async (dealId: number) => {
        console.warn(`Delete functionality for deal ${dealId} not implemented yet.`);
    };

    const openDeleteAssetConfirm = (portfolioAsset: PortfolioAsset) => {
        setAssetToDelete(portfolioAsset);
        setShowDeleteConfirmDialog(true);
    };

    const closeDeleteAssetConfirm = () => {
        setAssetToDelete(null);
        setShowDeleteConfirmDialog(false);
    };

    const handleConfirmDeleteAsset = async () => {
        if (assetToDelete && id) {
            const portfolioAssetId = assetToDelete.ID;
            closeDeleteAssetConfirm();
            try {
                await dispatch(deleteAssetFromPortfolio(portfolioAssetId)).unwrap();
                dispatch(fetchPortfolioDetails(Number(id)));
                dispatch(fetchPortfolioDeals(Number(id)));
            } catch (err) {
                console.error("Failed to delete asset:", err);
            }
        }
    };

    const handleFetchTinkoff = () => {
        if (tinkoffTokenInput.trim()) {
            dispatch(fetchTinkoffPortfolio(tinkoffTokenInput.trim()));
        }
    };

    const isLoading = portfolioStatus === 'loading' || dealsStatus === 'loading';
    const isDeletingAsset = assetDeletionStatus === 'loading';
    const hasInitialError = (portfolioStatus === 'failed' && portfolioError && !currentPortfolio) || (dealsStatus === 'failed' && dealsError && !deals);

    if (isLoading && !currentPortfolio) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress/>
            </Box>
        );
    }

    if (hasInitialError) {
        return (
            <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
                {portfolioStatus === 'failed' && portfolioError && !currentPortfolio && (
                    <Alert severity="error" sx={{mb: 2}}>Error loading portfolio details: {portfolioError}</Alert>
                )}
                {dealsStatus === 'failed' && dealsError && !deals && (
                    <Alert severity="error" sx={{mb: 2}}>Error loading deals: {dealsError}</Alert>
                )}
                <Typography>Unable to load portfolio data.</Typography>
            </Container>
        );
    }

    if (portfolioStatus !== 'loading' && !currentPortfolio) {
        return (
            <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
                <Typography>Portfolio not found or unable to load.</Typography>
            </Container>
        );
    }

    if (!currentPortfolio) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress/>
            </Box>
        );
    }

    const portfolioProfitLossNum = currentPortfolio.profit_loss != null ? parseFloat(String(currentPortfolio.profit_loss)) : NaN;

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
                {portfolioStatus === 'failed' && portfolioError &&
                    <Alert severity="error" sx={{mb: 2}}>{portfolioError}</Alert>}
                {dealsStatus === 'failed' && dealsError && <Alert severity="error" sx={{mb: 2}}>{dealsError}</Alert>}
                {assetDeletionStatus === 'failed' && assetDeletionError &&
                    <Alert severity="error" sx={{mb: 2}}>Failed to delete asset: {assetDeletionError}</Alert>}

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: {xs: 'column', sm: 'row'},
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            <Typography variant="h4" component="h1">{currentPortfolio.name}</Typography>
                            <Box>
                                <Button
                                    variant="contained"
                                    startIcon={<Add/>}
                                    onClick={() => setShowAddDealForm(true)}
                                    disabled={isLoading}
                                    sx={{mr: 1}}
                                >
                                    Add Deal
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<Add/>}
                                    onClick={() => setShowAddAssetForm(true)}
                                    disabled={isLoading}
                                >
                                    Add Asset Position
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={8} lg={9}>
                        <Paper sx={{p: 2, display: 'flex', flexDirection: 'column', height: 400}}>
                            <Typography variant="h6" gutterBottom>Portfolio Performance</Typography>
                            {currentPortfolio.portfolio_assets && currentPortfolio.portfolio_assets.length > 0 ? (
                                <PortfolioChart/>
                            ) : (
                                <Typography
                                    sx={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    Add assets to see the chart.
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper sx={{p: 2, height: '100%'}}>
                            <Typography variant="h6" gutterBottom>Statistics</Typography>
                            <Typography>Total Value: ${formatNumber(currentPortfolio.total_value)}</Typography>
                            <Typography
                                color={isNaN(portfolioProfitLossNum) ? 'text.primary' : portfolioProfitLossNum >= 0 ? 'success.main' : 'error.main'}>
                                P/L: ${formatNumber(currentPortfolio.profit_loss)}
                            </Typography>
                            <Typography>Yield: {formatNumber(currentPortfolio.yield_percent)}%</Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{p: 2, overflow: 'hidden'}}>
                            <Typography variant="h6" gutterBottom>Portfolio Assets</Typography>
                            <TableContainer sx={{maxHeight: 440}}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Ticker</TableCell>
                                            <TableCell>Company</TableCell>
                                            <TableCell align="right">Quantity</TableCell>
                                            <TableCell align="right">Avg Price</TableCell>
                                            <TableCell align="right">Current Price</TableCell>
                                            <TableCell align="right">Total Value</TableCell>
                                            <TableCell align="right">P/L ($)</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {currentPortfolio?.portfolio_assets?.length > 0 ? (
                                            currentPortfolio.portfolio_assets.map((pa) => {
                                                const avgPriceNum = pa.average_price != null ? parseFloat(String(pa.average_price)) : NaN;
                                                const currentPriceNum = pa.asset?.current_price != null ? parseFloat(String(pa.asset.current_price)) : NaN;
                                                const quantityNum = pa.quantity != null ? parseFloat(String(pa.quantity)) : NaN;
                                                const currentValue = !isNaN(currentPriceNum) && !isNaN(quantityNum) ? currentPriceNum * quantityNum : NaN;
                                                const costBasis = !isNaN(avgPriceNum) && !isNaN(quantityNum) ? avgPriceNum * quantityNum : NaN;
                                                const profitLoss = !isNaN(currentValue) && !isNaN(costBasis) ? currentValue - costBasis : NaN;
                                                const isDeletingCurrent = isDeletingAsset && assetToDelete?.ID === pa.ID;

                                                if (!pa.asset) return <TableRow key={`pa-${pa.ID}-missing`}><TableCell
                                                    colSpan={8}>Asset data missing for
                                                    ID {pa.ID}</TableCell></TableRow>;

                                                return (
                                                    <TableRow hover key={`pa-${pa.ID}`}
                                                              sx={isDeletingCurrent ? {opacity: 0.5} : {}}>
                                                        <TableCell>{pa.asset.ticker}</TableCell>
                                                        <TableCell>{pa.asset.company}</TableCell>
                                                        <TableCell
                                                            align="right">{formatNumber(pa.quantity, 4)}</TableCell>
                                                        <TableCell
                                                            align="right">${formatNumber(pa.average_price)}</TableCell>
                                                        <TableCell
                                                            align="right">${formatNumber(pa.asset.current_price)}</TableCell>
                                                        <TableCell
                                                            align="right">${formatNumber(currentValue)}</TableCell>
                                                        <TableCell align="right"
                                                                   sx={{color: isNaN(profitLoss) ? 'text.primary' : profitLoss >= 0 ? 'success.main' : 'error.main'}}>
                                                            ${formatNumber(profitLoss)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <IconButton
                                                                aria-label="view asset details"
                                                                size="small"
                                                                onClick={() => navigate(`/assets/${pa.asset.Asset_ID}`)}
                                                                disabled={isDeletingCurrent}
                                                            >
                                                                <Visibility fontSize="small"/>
                                                            </IconButton>
                                                            <IconButton
                                                                aria-label="delete asset position"
                                                                size="small"
                                                                color="error"
                                                                onClick={() => openDeleteAssetConfirm(pa)}
                                                                disabled={isDeletingAsset}
                                                            >
                                                                {isDeletingCurrent ?
                                                                    <CircularProgress size={20} color="inherit"/> :
                                                                    <DeleteIcon fontSize="small"/>}
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center">No assets in this portfolio
                                                    yet.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{p: 2, overflow: 'hidden'}}>
                            <Typography variant="h6" gutterBottom>Portfolio Deals</Typography>
                            {dealsStatus === 'loading' && (
                                <Box sx={{display: 'flex', justifyContent: 'center', my: 2}}><CircularProgress/></Box>
                            )}
                            {dealsStatus !== 'loading' && deals && (
                                <TableContainer sx={{maxHeight: 440}}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Ticker</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell align="right">Quantity</TableCell>
                                                <TableCell align="right">Price</TableCell>
                                                <TableCell align="right">Total</TableCell>
                                                <TableCell align="right">Commission</TableCell>
                                                <TableCell align="right">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {deals.length > 0 ? (
                                                deals.map((deal: Deal) => (
                                                    <TableRow hover key={`deal-${deal.Deal_ID}`}>
                                                        <TableCell>{deal.date ? format(new Date(deal.date), 'yyyy-MM-dd HH:mm') : 'N/A'}</TableCell>
                                                        <TableCell>{deal.asset_ticker || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{
                                                                color: deal.type ? 'success.main' : 'error.main',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {deal.type ? 'BUY' : 'SELL'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell
                                                            align="right">{formatNumber(deal.quantity, 4)}</TableCell>
                                                        <TableCell align="right">${formatNumber(deal.price)}</TableCell>
                                                        <TableCell align="right">${formatNumber(deal.total)}</TableCell>
                                                        <TableCell
                                                            align="right">${formatNumber(deal.commission)}</TableCell>
                                                        <TableCell align="right">
                                                            <IconButton
                                                                aria-label="delete deal"
                                                                size="small"
                                                                onClick={() => handleDeleteDeal(deal.Deal_ID)}
                                                                disabled
                                                            >
                                                                <DeleteIcon fontSize="small"/>
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={8} align="center">
                                                        {dealsStatus === 'failed' ? 'Error loading deals.' : 'No deals recorded for this portfolio yet.'}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{p: 2, mt: 3}}>
                            <Typography variant="h6" gutterBottom>
                                Import from Tinkoff Investments
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{mb: 2}}>
                                Enter your Tinkoff Invest API v2 token (read-only recommended) to fetch your portfolio
                                details.
                                Your token is sent securely to the backend server. Get token info{' '}
                                <Link href="https://tinkoff.github.io/investAPI/token/" target="_blank" rel="noopener">
                                    here
                                </Link>.
                            </Typography>
                            <Box sx={{display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2}}>
                                <TextField
                                    label="Tinkoff API Token"
                                    variant="outlined"
                                    type="password"
                                    value={tinkoffTokenInput}
                                    onChange={(e) => setTinkoffTokenInput(e.target.value)}
                                    fullWidth
                                    size="small"
                                    disabled={tinkoffStatus === 'loading'}
                                    placeholder="t.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleFetchTinkoff}
                                    disabled={!tinkoffTokenInput.trim() || tinkoffStatus === 'loading'}
                                    sx={{flexShrink: 0, height: '40px'}}
                                >
                                    {tinkoffStatus === 'loading' ?
                                        <CircularProgress size={24} color="inherit"/> : 'Fetch Portfolio'}
                                </Button>
                            </Box>

                            {tinkoffStatus === 'loading' && (
                                <Box sx={{display: 'flex', justifyContent: 'center', my: 2}}>
                                    <CircularProgress/>
                                </Box>
                            )}
                            {tinkoffStatus === 'failed' && tinkoffError && (
                                <Alert severity="error" sx={{mb: 2}}>{tinkoffError}</Alert>
                            )}
                            {tinkoffStatus === 'succeeded' && tinkoffPortfolioData && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Tinkoff Portfolio (Account ID: {tinkoffPortfolioData.account_id})
                                    </Typography>
                                    <Typography variant="body1" sx={{mb: 1}}>
                                        Total Portfolio Value:
                                        ≈ {formatDecimalString(tinkoffPortfolioData.total_amount_portfolio)}
                                    </Typography>
                                    <TableContainer component={Paper} sx={{mt: 1, maxHeight: 440}}>
                                        <Table stickyHeader size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>FIGI</TableCell>
                                                    <TableCell>Type</TableCell>
                                                    <TableCell align="right">Quantity</TableCell>
                                                    <TableCell align="right">Avg Price</TableCell>
                                                    <TableCell align="right">Current Price</TableCell>
                                                    <TableCell align="right">Exp. Yield ($)</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {tinkoffPortfolioData.positions.length > 0 ? (
                                                    tinkoffPortfolioData.positions.map((pos) => (
                                                        <TableRow hover key={pos.figi}>
                                                            <TableCell>{pos.figi}</TableCell>
                                                            <TableCell>{pos.instrument_type}</TableCell>
                                                            <TableCell
                                                                align="right">{formatDecimalString(pos.quantity, 4)}</TableCell>
                                                            <TableCell
                                                                align="right">{formatDecimalString(pos.average_position_price)} {pos.average_position_price_currency?.toUpperCase()}</TableCell>
                                                            <TableCell
                                                                align="right">{formatDecimalString(pos.current_price)} {pos.current_price_currency?.toUpperCase()}</TableCell>
                                                            <TableCell align="right"
                                                                       sx={{color: parseFloat(pos.expected_yield ?? '0') >= 0 ? 'success.main' : 'error.main'}}>
                                                                {formatDecimalString(pos.expected_yield)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={6} align="center">No positions found in
                                                            Tinkoff portfolio.</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Button variant="text" size="small" onClick={() => dispatch(clearTinkoffData())}
                                            sx={{mt: 1}}>
                                        Clear Loaded Data
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{p: 2, overflow: 'hidden'}}>
                            <Typography variant="h6" gutterBottom>Available Assets</Typography>
                            <TableContainer sx={{maxHeight: 440}}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Ticker</TableCell>
                                            <TableCell>Company</TableCell>
                                            <TableCell align="right">Price</TableCell>
                                            <TableCell align="right">Currency</TableCell>
                                            <TableCell align="right">Yield (%)</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {allAssets && allAssets.length > 0 ? (
                                            allAssets.map((asset: Asset) => (
                                                <TableRow hover key={`asset-${asset.Asset_ID}`}>
                                                    <TableCell>{asset.ticker}</TableCell>
                                                    <TableCell>{asset.company}</TableCell>
                                                    <TableCell
                                                        align="right">${formatNumber(asset.current_price)}</TableCell>
                                                    <TableCell align="right">{asset.currency}</TableCell>
                                                    <TableCell
                                                        align="right">{formatNumber(asset.dividend_yield)}%</TableCell>
                                                    <TableCell align="right">
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedAsset(asset);
                                                                setAssetPrice(asset.current_price != null ? String(asset.current_price) : '');
                                                                setShowAddAssetForm(true);
                                                            }}
                                                            disabled={isLoading}
                                                        >
                                                            Add Position
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    {portfolioStatus === 'loading' ? 'Loading available assets...' : 'No available assets found.'}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>

                <Dialog open={showAddAssetForm} onClose={handleCloseAddAssetDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Add Asset Position</DialogTitle>
                    <DialogContent>
                        <Autocomplete
                            options={allAssets || []}
                            getOptionLabel={(option) => option ? `${option.ticker} - ${option.company}` : ''}
                            value={selectedAsset}
                            onChange={(event, newValue: Asset | null) => {
                                setSelectedAsset(newValue);
                                if (newValue) {
                                    setAssetPrice(newValue.current_price != null ? String(newValue.current_price) : '');
                                } else {
                                    setAssetPrice('');
                                }
                            }}
                            isOptionEqualToValue={(option, value) => option?.Asset_ID === value?.Asset_ID}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Asset" margin="normal" fullWidth/>
                            )}
                        />
                        <TextField
                            label="Quantity" type="number" fullWidth margin="normal"
                            value={assetQuantity}
                            onChange={(e) => setAssetQuantity(e.target.value)}
                            inputProps={{min: "0", step: "any"}} required
                            error={assetQuantity !== '' && (isNaN(parseFloat(assetQuantity)) || parseFloat(assetQuantity) <= 0)}
                            helperText={assetQuantity !== '' && (isNaN(parseFloat(assetQuantity)) || parseFloat(assetQuantity) <= 0) ? "Quantity must be a positive number" : ""}
                        />
                        <TextField
                            label="Purchase Price per Share" type="number" fullWidth margin="normal"
                            value={assetPrice}
                            onChange={(e) => setAssetPrice(e.target.value)}
                            inputProps={{min: "0", step: "any"}} required
                            error={assetPrice !== '' && (isNaN(parseFloat(assetPrice)) || parseFloat(assetPrice) < 0)}
                            helperText={assetPrice !== '' && (isNaN(parseFloat(assetPrice)) || parseFloat(assetPrice) < 0) ? "Price must be a non-negative number" : ""}
                        />
                        {portfolioStatus === 'failed' && portfolioError && showAddAssetForm &&
                            <Alert severity="error" sx={{mt: 1}}>{portfolioError}</Alert>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAddAssetDialog}>Cancel</Button>
                        <Button
                            onClick={handleAddAssetSubmit}
                            variant="contained"
                            disabled={!selectedAsset || !assetQuantity || !assetPrice || isNaN(parseFloat(assetQuantity)) || parseFloat(assetQuantity) <= 0 || isNaN(parseFloat(assetPrice)) || parseFloat(assetPrice) < 0 || portfolioStatus === 'loading'}
                        >
                            {portfolioStatus === 'loading' ?
                                <CircularProgress size={24} color="inherit"/> : "Add Position"}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={showAddDealForm} onClose={handleCloseAddDealDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Add New Deal</DialogTitle>
                    <DialogContent>
                        <Autocomplete
                            options={allAssets || []}
                            getOptionLabel={(option) => option ? `${option.ticker} - ${option.company}` : ''}
                            value={selectedDealAsset}
                            onChange={(event, newValue: Asset | null) => {
                                setSelectedDealAsset(newValue);
                                if (newValue && newValue.current_price != null) {
                                    setDealPrice(String(newValue.current_price));
                                } else {
                                    setDealPrice('');
                                }
                            }}
                            isOptionEqualToValue={(option, value) => option?.Asset_ID === value?.Asset_ID}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Asset" margin="dense" fullWidth/>
                            )}
                        />
                        <FormControl fullWidth margin="dense" required>
                            <InputLabel id="deal-type-label">Deal Type</InputLabel>
                            <Select
                                labelId="deal-type-label"
                                value={dealType}
                                label="Deal Type"
                                onChange={(e) => setDealType(e.target.value as string)}
                                error={dealType === ''}
                            >
                                <MenuItem value="buy">Buy</MenuItem>
                                <MenuItem value="sell">Sell</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Quantity" type="number" fullWidth margin="dense"
                            value={dealQuantity}
                            onChange={(e) => setDealQuantity(e.target.value)}
                            inputProps={{min: "0", step: "any"}} required
                            error={dealQuantity !== '' && (isNaN(parseFloat(dealQuantity)) || parseFloat(dealQuantity) <= 0)}
                            helperText={dealQuantity !== '' && (isNaN(parseFloat(dealQuantity)) || parseFloat(dealQuantity) <= 0) ? "Quantity must be a positive number" : ""}
                        />
                        <TextField
                            label="Price per Share" type="number" fullWidth margin="dense"
                            value={dealPrice}
                            onChange={(e) => setDealPrice(e.target.value)}
                            inputProps={{min: "0", step: "any"}} required
                            error={dealPrice !== '' && (isNaN(parseFloat(dealPrice)) || parseFloat(dealPrice) < 0)}
                            helperText={dealPrice !== '' && (isNaN(parseFloat(dealPrice)) || parseFloat(dealPrice) < 0) ? "Price must be a non-negative number" : ""}
                        />
                        <DateTimePicker
                            label="Date and Time"
                            value={dealDate}
                            onChange={(newValue) => setDealDate(newValue)}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    margin: "dense",
                                    required: true,
                                    error: !dealDate,
                                    helperText: !dealDate ? "Date is required" : ""
                                }
                            }}
                        />
                        <TextField
                            label="Commission" type="number" fullWidth margin="dense"
                            value={dealCommission}
                            onChange={(e) => setDealCommission(e.target.value)}
                            inputProps={{min: "0", step: "any"}}
                            error={dealCommission !== '' && (isNaN(parseFloat(dealCommission)) || parseFloat(dealCommission) < 0)}
                            helperText={dealCommission !== '' && (isNaN(parseFloat(dealCommission)) || parseFloat(dealCommission) < 0) ? "Commission cannot be negative" : ""}
                        />
                        <TextField
                            label="Tax" type="number" fullWidth margin="dense"
                            value={dealTax}
                            onChange={(e) => setDealTax(e.target.value)}
                            inputProps={{min: "0", step: "any"}}
                            error={dealTax !== '' && (isNaN(parseFloat(dealTax)) || parseFloat(dealTax) < 0)}
                            helperText={dealTax !== '' && (isNaN(parseFloat(dealTax)) || parseFloat(dealTax) < 0) ? "Tax cannot be negative" : ""}
                        />
                        {dealsStatus === 'failed' && dealsError && showAddDealForm &&
                            <Alert severity="error" sx={{mt: 1}}>{dealsError}</Alert>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAddDealDialog}>Cancel</Button>
                        <Button
                            onClick={handleAddDealSubmit}
                            variant="contained"
                            disabled={
                                !selectedDealAsset || dealType === '' || !dealQuantity || !dealPrice || !dealDate ||
                                isNaN(parseFloat(dealQuantity)) || parseFloat(dealQuantity) <= 0 ||
                                isNaN(parseFloat(dealPrice)) || parseFloat(dealPrice) < 0 ||
                                (dealCommission !== '' && (isNaN(parseFloat(dealCommission)) || parseFloat(dealCommission) < 0)) ||
                                (dealTax !== '' && (isNaN(parseFloat(dealTax)) || parseFloat(dealTax) < 0)) ||
                                dealsStatus === 'loading'
                            }
                        >
                            {dealsStatus === 'loading' ? <CircularProgress size={24} color="inherit"/> : "Add Deal"}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={showDeleteConfirmDialog}
                    onClose={closeDeleteAssetConfirm}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        Confirm Deletion
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to remove the asset position
                            "{assetToDelete?.asset?.ticker || 'Unknown'}"
                            ({formatNumber(assetToDelete?.quantity, 4)} units)
                            from this portfolio? This action cannot be undone and will generate a sell transaction
                            record.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDeleteAssetConfirm} disabled={isDeletingAsset}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDeleteAsset}
                            color="error"
                            variant="contained"
                            disabled={isDeletingAsset}
                            autoFocus
                        >
                            {isDeletingAsset ? <CircularProgress size={20} color="inherit"/> : "Delete"}
                        </Button>
                    </DialogActions>
                </Dialog>

            </Container>
        </LocalizationProvider>
    );
};

export default PortfolioDetail;