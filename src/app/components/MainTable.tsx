import { useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { ClosuresTable } from './ClosuresTable';
import { OpeningsTable } from './OpeningsTable';

type DataType = 'closures' | 'openings';

export function MainTable() {
  const [dataType, setDataType] = useState<DataType>('closures');

  return (
    <section className="py-12">
      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setDataType('closures')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            dataType === 'closures'
              ? 'bg-[#0b3860] text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <TrendingDown className="w-5 h-5" />
          Closures Database
        </button>
        <button
          onClick={() => setDataType('openings')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            dataType === 'openings'
              ? 'bg-green-700 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          Openings Database
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 text-[#0b3860]">
          Complete {dataType === 'closures' ? 'Closure' : 'Opening'} Database
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          {dataType === 'closures'
            ? 'All observed closures to date. The closures listed here were either publicly disclosed or verified submissions by community members.'
            : 'All observed openings to date. The openings listed here were either publicly disclosed or verified submissions by community members.'}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        {dataType === 'closures' ? <ClosuresTable /> : <OpeningsTable />}
      </div>
    </section>
  );
}