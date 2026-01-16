import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-daily-bg text-daily-text font-sans selection:bg-daily-accent selection:text-black overflow-hidden">
      
      {/* ✨ [High-Density Ambient Background] 고밀도 광원 배치 ✨ */}
      {/* mix-blend-screen: 빛이 겹칠 때 더 환하게 빛나도록 함 */}
      
      {/* 1. 좌측 상단 (메인): 강렬한 에메랄드 (브랜드 컬러) */}
      <div className="fixed top-[-10%] left-[-10%] w-[700px] h-[700px] bg-emerald-500/40 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      
      {/* 2. 우측 상단: 시원한 파란색 */}
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/40 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      
      {/* 3. 중앙 좌측: 신비로운 보라색 (깊이감 담당) */}
      <div className="fixed top-[30%] left-[-20%] w-[600px] h-[600px] bg-purple-600/40 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* 4. 중앙 우측: 활력을 주는 핑크/로즈 (포인트) */}
      <div className="fixed top-[40%] right-[-10%] w-[500px] h-[500px] bg-rose-500/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      {/* 5. 하단 중앙: 밝은 청록색 (바닥을 받쳐줌) */}
      <div className="fixed bottom-[-20%] left-[20%] w-[800px] h-[600px] bg-cyan-500/30 rounded-full blur-[130px] pointer-events-none mix-blend-screen" />

      {/* 6. 화면 정중앙: 아주 은은하게 전체 톤을 잡는 빛 */}
      <div className="fixed top-[20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />


      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-daily-bg/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-daily-accent to-emerald-700 flex items-center justify-center text-black font-bold shadow-lg shadow-emerald-500/20">
                DT
              </div>
              <span className="text-xl font-bold tracking-tight text-white">DailyTicker</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;