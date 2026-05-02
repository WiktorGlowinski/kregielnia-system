'use client';
import { usePathname } from 'next/navigation';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <html lang="pl">
      <body className="bg-[#050505] text-white font-sans antialiased min-h-screen relative">
        
        {/* WIDEO NA CAŁEJ STRONIE (Tylko dla stron publicznych) */}
        {!isAdmin && (
          <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-105"
            >
              <source src="/bowling-bg.mp4" type="video/mp4" />
            </video>
            {/* Nakładka przyciemniająca tło */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#050505]/70 to-[#050505]"></div>
          </div>
        )}

        {/* Zawartość strony (Z-10 żeby była nad wideo) */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}