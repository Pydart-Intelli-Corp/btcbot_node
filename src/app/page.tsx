import {
  HeroSection,
  FeaturesSection,
  TradingPortfoliosSection,
  WhyChooseSection,
  TradeFromAnywhereSection,
  RecentTradesSection,
  CustomerReviewsSection,
  HowItWorksSection,
  AffiliateSection,
  MarketHeatmapSection,
  TrendingCryptoSection,
  Footer
} from '@/components';

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
        <TrendingCryptoSection />
      </main>
      <Footer />
    </div>
  );
}
