
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppData, Purchase, Sale, InventoryItem, Expense } from './types';
import InventoryManager from './components/InventoryManager';
import TransactionManager from './components/TransactionManager';
import Report from './components/Report';
import SalesHistory from './components/SalesHistory';
import DataManager from './components/DataManager';

const App: React.FC = () => {
  const [appData, setAppData] = useLocalStorage<AppData>('appData', {
    inventory: [],
    purchases: [],
    sales: [],
    rent: 0,
    otherExpenses: [],
  });
  const [isInventoryFullScreen, setIsInventoryFullScreen] = useState(false);

  // Proactively sanitize data on every render to prevent crashes.
  // This uses a stricter filter to ensure all items in arrays are valid objects.
  const sanitizedAppData: AppData = useMemo(() => {
    const isValidObject = (item: unknown): item is object => item && typeof item === 'object';
    return {
      rent: appData.rent || 0,
      inventory: (Array.isArray(appData.inventory) ? appData.inventory : []).filter(isValidObject),
      purchases: (Array.isArray(appData.purchases) ? appData.purchases : []).filter(isValidObject),
      sales: (Array.isArray(appData.sales) ? appData.sales : []).filter(isValidObject),
      otherExpenses: (Array.isArray(appData.otherExpenses) ? appData.otherExpenses : []).filter(isValidObject),
    };
  }, [appData]);

  // Effect for data migrations and persisting sanitization
  useEffect(() => {
    setAppData(currentData => {
      let needsUpdate = false;
      let migratedData: AppData = JSON.parse(JSON.stringify(currentData)); // Deep copy for safe mutation
      const isValidObject = (item: unknown): item is object => item && typeof item === 'object';

      // 1. Sanitize all major arrays by filtering out invalid entries (null, primitives, etc.)
      (['inventory', 'purchases', 'sales', 'otherExpenses'] as const).forEach(key => {
        const originalArray = (migratedData as any)[key];
        if (Array.isArray(originalArray)) {
            const sanitizedArray = originalArray.filter(isValidObject);
            if (sanitizedArray.length < originalArray.length) {
                (migratedData as any)[key] = sanitizedArray;
                needsUpdate = true;
            }
        } else {
            // Handle corrupted data that isn't an array
            (migratedData as any)[key] = [];
            needsUpdate = true;
        }
      });
      
      // 2. Migrate inventory items to have IDs
      if (Array.isArray(migratedData.inventory) && migratedData.inventory.some((item: InventoryItem) => !item.id)) {
        needsUpdate = true;
        migratedData.inventory = migratedData.inventory.map((item: InventoryItem, index: number) => ({
            ...item,
            id: item.id || `migrated-inv-${Date.now()}-${index}`
        }));
      }

      // 3. Migrate sales to have IDs for robust editing/deleting
      if (Array.isArray(migratedData.sales) && migratedData.sales.some((sale: Sale) => !sale.id)) {
        needsUpdate = true;
        migratedData.sales = migratedData.sales.map((sale: Sale, index: number) => ({
            ...sale,
            id: sale.id || `migrated-sale-${Date.now()}-${index}`
        }));
      }

      return needsUpdate ? migratedData : currentData;
    });
  }, [setAppData]);


  const handleAddPurchase = useCallback((purchase: Purchase) => {
    setAppData(prevData => {
      const purchaseWithDate = { ...purchase, date: purchase.date || new Date().toISOString() };
      
      const newInventoryItem: InventoryItem = {
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        item: purchase.item,
        quantity: purchase.quantity,
        costPerUnit: purchase.cost > 0 && purchase.quantity > 0 ? purchase.cost / purchase.quantity : 0,
        date: purchaseWithDate.date,
      };

      return {
        ...prevData,
        purchases: [...prevData.purchases, purchaseWithDate],
        inventory: [...prevData.inventory, newInventoryItem],
      };
    });
  }, [setAppData]);

  const handleAddSale = useCallback((sale: Omit<Sale, 'id'>) => {
    setAppData(prevData => {
      const saleWithDateAndId: Sale = {
        ...sale,
        id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: sale.date || new Date().toISOString(),
      };
      return {
        ...prevData,
        sales: [...prevData.sales, saleWithDateAndId],
      };
    });
  }, [setAppData]);

  const handleUpdateSale = useCallback((updatedSale: Sale) => {
    setAppData(prevData => ({
      ...prevData,
      sales: prevData.sales.map((sale) =>
        sale.id === updatedSale.id ? updatedSale : sale
      ),
    }));
  }, [setAppData]);

  const handleDeleteSale = useCallback((saleId: string) => {
    setAppData(prevData => ({
      ...prevData,
      sales: prevData.sales.filter((sale) => sale.id !== saleId),
    }));
  }, [setAppData]);

  const handleAddInventory = useCallback((item: Omit<InventoryItem, 'id'>) => {
     setAppData(prevData => {
      const existingItem = prevData.inventory.find(inv => inv.item.toLowerCase() === item.item.toLowerCase());
      if (existingItem) {
        alert('Item already exists. Use the "Add Purchase" form to add more stock.');
        return prevData;
      }
      const newItemWithId: InventoryItem = {
        ...item,
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      return {
        ...prevData,
        inventory: [...prevData.inventory, newItemWithId],
      };
    });
  }, [setAppData]);

  const handleSetRent = useCallback((rent: number) => {
    setAppData(prevData => ({ ...prevData, rent }));
  }, [setAppData]);
  
  const handleAddExpense = useCallback((expense: Expense) => {
    setAppData(prevData => ({
      ...prevData,
      otherExpenses: [...prevData.otherExpenses, expense],
    }));
  }, [setAppData]);

  const handleDeleteExpense = useCallback((expenseIndex: number) => {
    setAppData(prevData => ({
      ...prevData,
      otherExpenses: prevData.otherExpenses.filter((_, index) => index !== expenseIndex),
    }));
  }, [setAppData]);

  const handleUpdateInventoryItem = useCallback((updatedItem: InventoryItem) => {
    setAppData(prevData => ({
      ...prevData,
      inventory: prevData.inventory.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    }));
  }, [setAppData]);

  const handleDeleteInventoryItem = useCallback((itemId: string) => {
    setAppData(prevData => ({
      ...prevData,
      inventory: prevData.inventory.filter(item => item.id !== itemId),
    }));
  }, [setAppData]);

  const handleToggleInventoryFullScreen = useCallback(() => {
    setIsInventoryFullScreen(prev => !prev);
  }, []);


  return (
    <div className="min-h-screen bg-base p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary tracking-wider">
            🍕 Pizza Kiosk Analyzer
          </h1>
          <p className="text-secondary mt-2">Your offline-first inventory and cost assistant.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {!isInventoryFullScreen && (
            <div className="lg:col-span-2 space-y-6">
              <TransactionManager onAddPurchase={handleAddPurchase} onAddSale={handleAddSale} inventory={sanitizedAppData.inventory} />
              <Report data={sanitizedAppData} />
              <SalesHistory 
                sales={sanitizedAppData.sales} 
                onUpdateSale={handleUpdateSale}
                onDeleteSale={handleDeleteSale}
              />
              <DataManager appData={sanitizedAppData} onImportData={setAppData} />
            </div>
          )}

          <div className={isInventoryFullScreen ? "lg:col-span-3" : ""}>
            <InventoryManager 
              inventory={sanitizedAppData.inventory} 
              onAddInventory={handleAddInventory} 
              onSetRent={handleSetRent} 
              currentRent={appData.rent}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              currentOtherExpenses={sanitizedAppData.otherExpenses}
              onUpdateInventoryItem={handleUpdateInventoryItem}
              onDeleteInventoryItem={handleDeleteInventoryItem}
              isFullScreen={isInventoryFullScreen}
              onToggleFullScreen={handleToggleInventoryFullScreen}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
