import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-daily-bg text-daily-text font-sans selection:bg-daily-accent selection:text-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-daily-border bg-daily-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-daily-accent to-emerald-700 flex items-center justify-center text-black font-bold">
                DT
              </div>
              <span className="text-xl font-bold tracking-tight">DailyTicker</span>
            </div>

          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;