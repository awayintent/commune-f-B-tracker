import { config } from '@/app/config/env';

export function MainTable() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#0b3860]">Complete Closure Database</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-[#0b3860]/20" style={{ minHeight: '600px' }}>
        <iframe
          src={config.sheetsEmbedUrl}
          className="w-full border-0"
          style={{ height: '600px' }}
          title="F&B Closures Database"
        />
      </div>
    </section>
  );
}