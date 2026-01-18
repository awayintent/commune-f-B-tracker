export function Header() {
  return (
    <header className="border-b bg-[#0b3860]">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
            Singapore F&B Closures Tracker
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">by</span>
            <span className="text-white font-bold">COMMUNE</span>
          </div>
        </div>
      </div>
    </header>
  );
}