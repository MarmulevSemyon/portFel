import { useState, useEffect } from 'react';
import { Asset } from '../types/portfolio';

interface DealFormProps {
    portfolioId: number;
    onClose: () => void;
}

const DealForm = ({ portfolioId, onClose }: DealFormProps) => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [formData, setFormData] = useState({
        asset: '',
        type: 'buy',
        quantity: '',
        price: '',
        date: new Date().toISOString().slice(0, 16)
    });

    useEffect(() => {
        fetch('/api/assets/')
            .then(res => res.json())
            .then(setAssets);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch(`/api/portfolios/${portfolioId}/deals/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                quantity: parseFloat(formData.quantity),
                price: parseFloat(formData.price)
            })
        });

        if (response.ok) {
            onClose();
            window.location.reload();
        }
    };

    return (
        <div className="deal-form-modal">
            <form onSubmit={handleSubmit}>
                <h3>New Transaction</h3>

                <select
                    value={formData.asset}
                    onChange={e => setFormData({...formData, asset: e.target.value})}
                    required
                >
                    <option value="">Select Asset</option>
                    {assets.map(asset => (
                        <option key={asset.Asset_ID} value={asset.Asset_ID}>
                            {asset.ticker} - {asset.company}
                        </option>
                    ))}
                </select>

                <select
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                </select>

                <input
                    type="number"
                    step="0.0001"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: e.target.value})}
                    placeholder="Quantity"
                    required
                />

                <input
                    type="number"
                    step="0.0001"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    placeholder="Price per unit"
                    required
                />

                <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    required
                />

                <div className="form-actions">
                    <button type="button" onClick={onClose}>Cancel</button>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    );
};

export default DealForm;