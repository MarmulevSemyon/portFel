import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Autocomplete } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { searchAssets } from '../store/slices/assetsSlice';
import { Asset } from '../types/portfolio';

interface AddTransactionFormProps {
    open: boolean;
    onClose: () => void;
    portfolioId: number;
}

const AddTransactionForm = ({ open, onClose, portfolioId }: AddTransactionFormProps) => {
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [quantity, setQuantity] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [type, setType] = useState<'buy' | 'sell'>('buy');
    const dispatch = useAppDispatch();
    const { assets } = useAppSelector((state) => state.assets);

    useEffect(() => {
        dispatch(searchAssets(''));
    }, [dispatch]);

    const handleSubmit = async () => {
        if (!selectedAsset || !quantity || !price) return;

        // Здесь будет логика добавления сделки
        console.log({
            portfolio: portfolioId,
            asset: selectedAsset.Asset_ID,
            type,
            quantity: parseFloat(quantity),
            price: parseFloat(price),
            total: parseFloat(quantity) * parseFloat(price)
        });

        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogContent>
                <Autocomplete
                    options={assets}
                    getOptionLabel={(option) => `${option.ticker} - ${option.company}`}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search Asset"
                            margin="normal"
                            fullWidth
                        />
                    )}
                    onChange={(e, value) => setSelectedAsset(value)}
                />

                <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />

                <TextField
                    label="Price per Share"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />

                <div style={{ marginTop: 16 }}>
                    <Button
                        variant={type === 'buy' ? 'contained' : 'outlined'}
                        onClick={() => setType('buy')}
                        sx={{ marginRight: 2 }}
                    >
                        Buy
                    </Button>
                    <Button
                        variant={type === 'sell' ? 'contained' : 'outlined'}
                        onClick={() => setType('sell')}
                    >
                        Sell
                    </Button>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!selectedAsset || !quantity || !price}
                >
                    Add Transaction
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddTransactionForm;