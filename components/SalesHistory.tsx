import React, { useState } from 'react';
import { Sale } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';

interface SalesHistoryProps {
  sales: Sale[];
  onUpdateSale: (sale: Sale, index: number) => void;
  onDeleteSale: (index: number) => void;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ sales, onUpdateSale, onDeleteSale }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedSale, setEditedSale] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);

  const handleEditClick = (sale: Sale, index: number) => {
    setEditingIndex(index);
    setEditedSale({ ...sale });
    setSaleToDelete(null);
  };

  const handleSaveClick = () => {
    if (editedSale && editingIndex !== null) {
      const saleToSave: Sale = {
          ...editedSale,
          revenue: parseFloat(String(editedSale.revenue)) || 0,
      };
      onUpdateSale(saleToSave, editingIndex);
      setEditingIndex(null);
      setEditedSale(null);
    }
  };

  const handleCancelClick = () => {
    setEditingIndex(null);
    setEditedSale(null);
    setSaleToDelete(null);
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
  
  const handleConfirmDelete = (index: number) => {
    onDeleteSale(index);
    setEditingIndex(null);
    setEditedSale(null);
    setSaleToDelete(null);
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
            {sales.length > 0 ? (
              sales.slice().reverse().map((sale, reversedIndex) => {
                const index = sales.length - 1 - reversedIndex;
                return (
                <tr key={index} className="border-b border-gray-800">
                   {editingIndex === index ? (
                     saleToDelete === index ? (
                      <>
                         <td className="p-2 font-medium text-red-400" colSpan={2}>Are you sure?</td>
                         <td className="p-2 text-center">
                             <div className="flex gap-2 justify-center items-center">
                                 <Button onClick={() => handleConfirmDelete(index)} className="bg-red-600 hover:bg-red-700 text-xs py-1 px-2">Confirm</Button>
                                 <Button onClick={() => setSaleToDelete(null)} className="bg-gray-600 hover:bg-gray-700 text-xs py-1 px-2">Cancel</Button>
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
                            <button onClick={() => setSaleToDelete(index)} className="text-red-500 hover:text-red-400 text-xl">🗑️</button>
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
                              <button onClick={() => handleEditClick(sale, index)} className="text-primary hover:text-accent">✏️</button>
                          </div>
                      </td>
                    </>
                  )}
                </tr>
              )})
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
