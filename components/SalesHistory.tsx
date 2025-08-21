
import React, { useState, useMemo } from 'react';
import { Sale } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';

interface SalesHistoryProps {
  sales: Sale[];
  onUpdateSale: (sale: Sale) => void;
  onDeleteSale: (saleId: string) => void;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ sales, onUpdateSale, onDeleteSale }) => {
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editedSale, setEditedSale] = useState<Sale | null>(null);
  const [saleToDeleteId, setSaleToDeleteId] = useState<string | null>(null);

  const cleanSales = useMemo(() => (sales || []).filter(item => item && typeof item === 'object'), [sales]);

  const handleEditClick = (sale: Sale) => {
    setEditingSaleId(sale.id);
    setEditedSale({ ...sale });
    setSaleToDeleteId(null);
  };

  const handleSaveClick = () => {
    if (editedSale && editingSaleId !== null) {
      const saleToSave: Sale = {
          ...editedSale,
          revenue: parseFloat(String(editedSale.revenue)) || 0,
      };
      onUpdateSale(saleToSave);
      setEditingSaleId(null);
      setEditedSale(null);
    }
  };

  const handleCancelClick = () => {
    setEditingSaleId(null);
    setEditedSale(null);
    setSaleToDeleteId(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedSale) {
      const { name, value } = e.target;
      setEditedSale({
        ...editedSale,
        [name]: name === 'date' ? new Date(value).toISOString() : value,
      });
    }
  };
  
  const handleConfirmDelete = (saleId: string) => {
    onDeleteSale(saleId);
    setEditingSaleId(null);
    setEditedSale(null);
    setSaleToDeleteId(null);
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-primary">Sales History</h2>
      </div>
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-sky-900">
              <th className="p-2 font-bold text-primary">Date</th>
              <th className="p-2 text-right font-bold text-primary">Revenue</th>
              <th className="p-2 text-center font-bold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cleanSales.length > 0 ? (
              cleanSales.slice().sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).map((sale) => (
                <tr key={sale.id} className="border-b border-gray-800">
                   {editingSaleId === sale.id ? (
                     saleToDeleteId === sale.id ? (
                      <>
                         <td className="p-2 font-medium text-red-400" colSpan={2}>Are you sure?</td>
                         <td className="p-2 text-center">
                             <div className="flex gap-2 justify-center items-center">
                                 <Button onClick={() => handleConfirmDelete(sale.id)} className="bg-red-600 hover:bg-red-700 text-xs py-1 px-2">Confirm</Button>
                                 <Button onClick={() => setSaleToDeleteId(null)} className="bg-gray-600 hover:bg-gray-700 text-xs py-1 px-2">Cancel</Button>
                             </div>
                         </td>
                      </>
                     ) : (
                      <>
                        <td className="p-2">
                          <Input
                            type="date"
                            name="date"
                            value={editedSale?.date ? new Date(editedSale.date).toISOString().split('T')[0] : ''}
                            onChange={handleEditChange}
                            className="py-1 text-sm bg-gray-800"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <Input
                            type="number"
                            name="revenue"
                            value={editedSale?.revenue ?? ''}
                            onChange={handleEditChange}
                            className="py-1 text-sm bg-gray-800 text-right w-32"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex gap-3 justify-center items-center">
                            <button onClick={handleSaveClick} className="text-green-400 hover:text-green-300 text-xl font-bold">✓</button>
                            <button onClick={() => setSaleToDeleteId(sale.id)} className="text-red-500 hover:text-red-400 text-xl">🗑️</button>
                            <button onClick={handleCancelClick} className="text-red-400 hover:text-red-300 text-xl font-bold">✗</button>
                          </div>
                        </td>
                      </>
                     )
                  ) : (
                    <>
                      <td className="p-2 font-medium">
                        {sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-2 text-right">₱{(parseFloat(String(sale.revenue)) || 0).toFixed(2)}</td>
                      <td className="p-2 text-center">
                          <div className="flex gap-3 justify-center">
                              <button onClick={() => handleEditClick(sale)} className="text-primary hover:text-accent">✏️</button>
                          </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-400">
                  No sales recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default SalesHistory;
