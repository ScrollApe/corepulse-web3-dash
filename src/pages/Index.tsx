
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import PulseWave from '@/components/ui/PulseWave';
import { Link } from 'react-router-dom';
import { useWalletConnect } from '@/providers/WalletProvider';
import { useAccount } from 'wagmi';

const Index = () => {
  const { connect } = useWalletConnect();
  const { isConnected } = useAccount();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-8 mb-10 md:mb-0">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-corepulse-gray-900 mb-4">
                Mine Web3 Rewards with <span className="text-corepulse-orange">CorePulse</span>
              </h1>
              <p className="text-lg sm:text-xl text-corepulse-gray-600 mb-8">
                Connect your wallet and start mining $CORE tokens. Boost your earnings with NFTs and build your Web3 mining empire.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {isConnected ? (
                  <Button asChild className="bg-corepulse-orange hover:bg-corepulse-orange-hover px-8 py-6 text-lg relative button-pulse">
                    <Link to="/dashboard">
                      Go to Dashboard
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    className="bg-corepulse-orange hover:bg-corepulse-orange-hover px-8 py-6 text-lg relative button-pulse"
                    onClick={connect}
                  >
                    Connect Wallet & Start Mining
                  </Button>
                )}
                <Button variant="outline" className="border-corepulse-gray-300 px-8 py-6 text-lg">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="w-64 h-64 mx-auto relative">
                <div className="absolute inset-0">
                  <PulseWave size={300} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-corepulse-orange flex items-center justify-center z-10 animate-float">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-corepulse-orange rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-corepulse-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-corepulse-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-corepulse-gray-600 max-w-2xl mx-auto">
              Start mining $CORE tokens in three simple steps. No complex hardware or technical knowledge required.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-corepulse-gray-200 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-corepulse-orange text-white flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Connect Wallet</h3>
              <p className="text-corepulse-gray-600">
                Connect your Web3 wallet to the CorePulse platform. We support MetaMask, WalletConnect, and more.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-corepulse-gray-200 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-corepulse-orange text-white flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Start Mining</h3>
              <p className="text-corepulse-gray-600">
                Click the mining button to start generating $CORE tokens. Keep your browser open to continue mining.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-corepulse-gray-200 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-corepulse-orange text-white flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Mint NFT Boost</h3>
              <p className="text-corepulse-gray-600">
                Increase your mining speed by minting CorePulse NFTs. Each NFT provides a permanent mining boost.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center mt-12">
            <Button asChild className="bg-corepulse-orange hover:bg-corepulse-orange-hover px-8 py-6 text-lg relative button-pulse">
              <Link to="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-corepulse-gray-900 mb-4">
              Features
            </h2>
            <p className="text-lg text-corepulse-gray-600 max-w-2xl mx-auto">
              CorePulse brings next-generation Web3 mining to your browser
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 border border-corepulse-gray-200 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-corepulse-orange bg-opacity-20 flex items-center justify-center mb-4">
                <span className="text-corepulse-orange text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Effortless Mining</h3>
              <p className="text-corepulse-gray-600">
                Mine $CORE tokens directly from your browser. No special hardware or downloads required.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="p-6 border border-corepulse-gray-200 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-corepulse-orange bg-opacity-20 flex items-center justify-center mb-4">
                <span className="text-corepulse-orange text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Platform</h3>
              <p className="text-corepulse-gray-600">
                Built on secure Web3 technologies with fully audited smart contracts.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="p-6 border border-corepulse-gray-200 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-corepulse-orange bg-opacity-20 flex items-center justify-center mb-4">
                <span className="text-corepulse-orange text-2xl">🎮</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Gamified Experience</h3>
              <p className="text-corepulse-gray-600">
                Level up your avatar and earn special rewards as you mine more tokens.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="p-6 border border-corepulse-gray-200 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-corepulse-orange bg-opacity-20 flex items-center justify-center mb-4">
                <span className="text-corepulse-orange text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Performance Tracking</h3>
              <p className="text-corepulse-gray-600">
                Monitor your mining performance with detailed analytics and statistics.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="p-6 border border-corepulse-gray-200 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-corepulse-orange bg-opacity-20 flex items-center justify-center mb-4">
                <span className="text-corepulse-orange text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Competitive Leaderboard</h3>
              <p className="text-corepulse-gray-600">
                Compete with other miners and earn additional rewards for top performance.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="p-6 border border-corepulse-gray-200 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-corepulse-orange bg-opacity-20 flex items-center justify-center mb-4">
                <span className="text-corepulse-orange text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Join a Crew</h3>
              <p className="text-corepulse-gray-600">
                Team up with other miners to combine your mining power and receive crew bonuses.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-corepulse-orange to-corepulse-orange-light text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Start Mining?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join thousands of miners already earning $CORE tokens. Connect your wallet and start mining today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {isConnected ? (
              <Button asChild className="bg-white text-corepulse-orange hover:bg-corepulse-gray-100 px-8 py-6 text-lg">
                <Link to="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <Button 
                className="bg-white text-corepulse-orange hover:bg-corepulse-gray-100 px-8 py-6 text-lg"
                onClick={connect}
              >
                Connect Wallet
              </Button>
            )}
            <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-corepulse-orange px-8 py-6 text-lg">
              <Link to="/mint">
                Explore NFTs
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
