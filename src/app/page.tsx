import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TradingPortfoliosSection from '@/components/TradingPortfoliosSection';
import WhyChooseSection from '@/components/WhyChooseSection';
import TradeFromAnywhereSection from '@/components/TradeFromAnywhereSection';
import RecentTradesSection from '@/components/RecentTradesSection';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import AffiliateSection from '@/components/AffiliateSection';
import MarketHeatmapSection from '@/components/MarketHeatmapSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <main>
        <HeroSection />
        <FeaturesSection />
        <TradingPortfoliosSection />
        <WhyChooseSection />
        <TradeFromAnywhereSection />
        <RecentTradesSection />
        <CustomerReviewsSection />
        <HowItWorksSection />
        <AffiliateSection />
        <MarketHeatmapSection />
      </main>
      <Footer />
    </div>
  );
}
