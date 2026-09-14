import { TopBar } from './components/TopBar';
import { Toast } from './components/Toast';
import { DayProgress } from './components/DayProgress';
import { BottomNav } from './components/BottomNav';
import { ProductDetailSheet } from './components/ProductDetailSheet';
import { VersionTag } from './components/VersionTag';
import { HomeScreen } from './screens/HomeScreen';
import { DesignScreen } from './screens/DesignScreen';
import { MarketScreen } from './screens/MarketScreen';
import { FinanceScreen } from './screens/FinanceScreen';
import { MoreScreen } from './screens/MoreScreen';
import { useGameClock } from './hooks/useGameClock';
import { useGameStore } from './store/gameStore';

export default function App() {
  // Starts the real-time day clock (and stops it when paused).
  useGameClock();

  const activeTab = useGameStore((s) => s.activeTab);

  return (
    // Outer page: centers the phone-shaped app on bigger screens.
    <div className="flex min-h-[100dvh] w-full justify-center bg-ink-900">
      <div className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-ink-800 sm:my-5 sm:h-[calc(100dvh-2.5rem)] sm:rounded-[36px] sm:border sm:border-white/[0.08] sm:shadow-2xl">
        <TopBar />
        <DayProgress />

        {/*
          Each screen is keyed, so switching tabs remounts it and its spring
          entrance plays. (Screens are swapped directly rather than wrapped in
          AnimatePresence, which can stall if a nested animation is mid-flight.)
        */}
        <main className="no-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden overscroll-none">
          {activeTab === 'home' && <HomeScreen key="home" />}
          {activeTab === 'design' && <DesignScreen key="design" />}
          {activeTab === 'market' && <MarketScreen key="market" />}
          {activeTab === 'finance' && <FinanceScreen key="finance" />}
          {activeTab === 'more' && <MoreScreen key="more" />}
        </main>

        <Toast />
        <ProductDetailSheet />
        <VersionTag />
        <BottomNav />
      </div>
    </div>
  );
}
