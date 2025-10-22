import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-black via-gray-900 to-purple-900 min-h-screen flex items-center">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Smart AI Arbitrage Trading{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                -Automated Profit System
              </span>
            </h1>
            
            <h2 className="text-xl lg:text-2xl text-gray-300 mb-8 font-semibold">
              Empowering Investors with AI-Driven Profit Automation
            </h2>
            
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto lg:mx-0">
              BTC BOT 24 leverages AI, machine learning, and real-time market analysis to identify 
              and execute profitable arbitrage opportunities across global exchanges — 24/7.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/login"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 border-2 border-blue-500 text-blue-400 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105"
              >
                Sign up
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 text-center lg:text-left">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-white">$100+</div>
                <div className="text-gray-400">Min Investment</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-white">24/7</div>
                <div className="text-gray-400">AI Trading</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-white">2.25%</div>
                <div className="text-gray-400">Max Daily ROI</div>
              </div>
            </div>
          </div>

          {/* Right Content - Robot Illustration */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Animated Background Circle */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full animate-pulse"></div>
              
              {/* Robot Container */}
              <div className="relative w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border border-gray-700">
                {/* Robot Icon Placeholder */}
                <div className="w-48 h-48 lg:w-56 lg:h-56 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <div className="text-white text-6xl lg:text-7xl font-bold">🤖</div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-8 right-8 w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="absolute bottom-12 left-12 w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-75"></div>
                <div className="absolute top-20 left-8 w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></div>
              </div>
              
              {/* Orbit Elements */}
              <div className="absolute inset-0 animate-spin-slow">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;