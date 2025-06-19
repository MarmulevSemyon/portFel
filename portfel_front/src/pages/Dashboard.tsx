import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom'; // Добавлен импорт useNavigate
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
    fetchPortfolios,
    createNewPortfolio,
    deletePortfolio,
    updatePortfolio
} from '../store/slices/portfolioSlice';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    Dialog,
    DialogActions,
    DialogTitle,
    TextField,
    Tooltip
} from '@mui/material';
import {
    Add,
    Delete,
    Edit,
    Visibility,
    Refresh
} from '@mui/icons-material';
import {Portfolio} from '../types/portfolio';
import numeral from 'numeral';
import {format} from 'date-fns';

const Dashboard = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate(); // Инициализация навигации
    const {portfolios, status, error} = useAppSelector((state) => state.portfolio);
    const {user} = useAppSelector((state) => state.auth);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        if (user) {
            dispatch(fetchPortfolios());
        }
    }, [dispatch, user]);

    const handleCreatePortfolio = async () => {
        const portfolioName = `Portfolio ${portfolios.length + 1}`;
        await dispatch(createNewPortfolio(portfolioName));
    };

    const handleDelete = async () => {
        if (selectedPortfolio) {
            await dispatch(deletePortfolio(selectedPortfolio.Port_ID));
            setOpenDeleteDialog(false);
        }
    };

    const handleUpdate = async () => {
        if (selectedPortfolio && editName) {
            await dispatch(updatePortfolio({
                ...selectedPortfolio,
                name: editName
            }));
            setOpenEditDialog(false);
        }
    };

    // Функция для перехода к деталям портфеля
    const handleViewDetails = (portfolioId: number) => {
        navigate(`/portfolio/${portfolioId}`);
    };

    const formatCurrency = (value: number) => numeral(value).format('$0,0.00');
    const formatPercentage = (value: number) => numeral(value / 100).format('0.00%');

    if (status === 'loading') return <CircularProgress sx={{mt: 4}}/>;
    if (error) return <Alert severity="error" sx={{mt: 4}}>{error}</Alert>;

    return (
        <div style={{padding: '24px'}}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <h1 style={{margin: 0}}>My Investment Portfolios</h1>
                <div>
                    <Button
                        variant="contained"
                        startIcon={<Add/>}
                        onClick={handleCreatePortfolio}
                        sx={{mr: 2}}
                    >
                        New Portfolio
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh/>}
                        onClick={() => dispatch(fetchPortfolios())}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            <TableContainer component={Paper} sx={{borderRadius: 2}}>
                <Table sx={{minWidth: 650}} aria-label="portfolios table">
                    <TableHead sx={{bgcolor: 'background.default'}}>
                        <TableRow>
                            <TableCell>Portfolio Name</TableCell>
                            <TableCell align="right">Total Value</TableCell>
                            <TableCell align="right">Profit/Loss</TableCell>
                            <TableCell align="right">Yield</TableCell>
                            <TableCell align="right">Annual Yield</TableCell>
                            <TableCell align="right">Created Date</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {portfolios.map((portfolio) => (
                            <TableRow key={portfolio.Port_ID}>
                                <TableCell component="th" scope="row">
                                    {portfolio.name}
                                </TableCell>
                                <TableCell align="right">
                                    {formatCurrency(portfolio.total_value)}
                                </TableCell>
                                <TableCell align="right" sx={{
                                    color: portfolio.profit_loss >= 0 ? 'success.main' : 'error.main'
                                }}>
                                    {formatCurrency(portfolio.profit_loss)}
                                </TableCell>
                                <TableCell align="right">
                                    {formatPercentage(portfolio.yield_percent)}
                                </TableCell>
                                <TableCell align="right">
                                    {formatPercentage(portfolio.annual_yield)}
                                </TableCell>
                                <TableCell align="right">
                                    {format(new Date(portfolio.created_at), 'dd MMM yyyy')}
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="View Details">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleViewDetails(portfolio.Port_ID)}
                                        >
                                            <Visibility/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit Portfolio">
                                        <IconButton
                                            color="secondary"
                                            onClick={() => {
                                                setSelectedPortfolio(portfolio);
                                                setEditName(portfolio.name);
                                                setOpenEditDialog(true);
                                            }}
                                        >
                                            <Edit/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Portfolio">
                                        <IconButton
                                            color="error"
                                            onClick={() => {
                                                setSelectedPortfolio(portfolio);
                                                setOpenDeleteDialog(true);
                                            }}
                                        >
                                            <Delete/>
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Диалог удаления */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>
                    Delete "{selectedPortfolio?.name}" portfolio?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог редактирования */}
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Edit Portfolio Name</DialogTitle>
                <div style={{padding: '24px'}}>
                    <TextField
                        fullWidth
                        label="Portfolio Name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                    />
                </div>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleUpdate}
                        color="primary"
                        variant="contained"
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Dashboard;