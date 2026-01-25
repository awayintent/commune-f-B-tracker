import { createContext, useContext, useState, ReactNode } from 'react';

export type DataType = 'closures' | 'openings';

interface DataTypeContextType {
  dataType: DataType;
  setDataType: (type: DataType) => void;
}

const DataTypeContext = createContext<DataTypeContextType | undefined>(undefined);

export function DataTypeProvider({ children }: { children: ReactNode }) {
  const [dataType, setDataType] = useState<DataType>('closures');

  return (
    <DataTypeContext.Provider value={{ dataType, setDataType }}>
      {children}
    </DataTypeContext.Provider>
  );
}

export function useDataType() {
  const context = useContext(DataTypeContext);
  if (context === undefined) {
    throw new Error('useDataType must be used within a DataTypeProvider');
  }
  return context;
}
