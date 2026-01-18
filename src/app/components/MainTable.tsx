import { ClosuresTable } from './ClosuresTable';

export function MainTable() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#0b3860]">Complete Closure Database</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <ClosuresTable />
      </div>
    </section>
  );
}