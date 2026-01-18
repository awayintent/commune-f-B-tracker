import communeLogo from 'figma:asset/5e18ce48629e7cc4be8c2b9f12f2af1a415d4d1a.png';

export function Footer() {
  return (
    <footer className="border-t bg-[#0b3860] mt-16">
      <div className="container mx-auto px-4 py-8">
        <a 
          href="https://commune-asia.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img src={communeLogo} alt="Commune" className="h-8" />
          <p className="text-gray-300 text-center">
            © 2026 Commune Asia. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 text-center">
            Visit our homepage for more insights on Singapore's F&B industry.
          </p>
        </a>
      </div>
    </footer>
  );
}