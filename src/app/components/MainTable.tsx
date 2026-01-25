import { ClosuresTable } from './ClosuresTable';
import { OpeningsTable } from './OpeningsTable';
import { useDataType } from '@/app/context/DataTypeContext';

export function MainTable() {
  const { dataType } = useDataType();

  return (
    <section className="py-12">

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