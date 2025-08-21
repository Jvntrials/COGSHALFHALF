import React, { useRef } from 'react';
import { AppData } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface DataManagerProps {
  appData: AppData;
  onImportData: (data: AppData) => void;
}

const DataManager: React.FC<DataManagerProps> = ({ appData, onImportData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    try {
      const jsonString = JSON.stringify(appData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.download = `pizza-kiosk-backup-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Could not export data. See console for details.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("File could not be read properly.");
        }
        const importedData = JSON.parse(text);

        // Basic validation
        if (!('inventory' in importedData && 'sales' in importedData && 'purchases' in importedData)) {
            throw new Error("Invalid data structure in backup file.");
        }

        const isConfirmed = window.confirm(
            "This will overwrite all current data in the application. Are you sure you want to proceed?"
        );

        if (isConfirmed) {
            onImportData(importedData);
            alert("Data imported successfully!");
        }

      } catch (error) {
        console.error("Error importing data:", error);
        alert(`Failed to import data. Please ensure you are uploading a valid backup file. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        // Reset file input to allow re-uploading the same file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-primary mb-4">Data Management</h2>
      <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-4">
        <Button onClick={handleExportData} className="w-full sm:w-auto">
          Export Data (Backup)
        </Button>
        <Button onClick={handleImportClick} className="w-full sm:w-auto bg-sky-700 hover:bg-sky-800">
          Import Data (Restore)
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          className="hidden"
          aria-hidden="true"
        />
      </div>
      <p className="text-sm text-gray-400 mt-4">
        Export your data to a file as a backup. You can import this file later to restore your application state. This is useful for moving data between devices.
      </p>
    </Card>
  );
};

export default DataManager;
