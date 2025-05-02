
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, Wallet } from 'lucide-react';
import { useWalletConnect } from '@/providers/WalletProvider';
import { useAccount } from 'wagmi';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { connect } = useWalletConnect();
  const { address, isConnected } = useAccount();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const links = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Mint NFT", href: "/mint" },
    { title: "Leaderboard", href: "/leaderboard" },
    { title: "Crew", href: "/crews" },
    { title: "Lore & Challenges", href: "/lore" }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Format wallet address for display
  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 w-full bg-white border-b border-corepulse-gray-200 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <div className="h-8 w-8 rounded-full bg-corepulse-orange flex items-center justify-center">
              <div className="h-4 w-4 bg-white rounded-full"></div>
            </div>
            <span className="font-bold text-xl text-corepulse-gray-900">CorePulse</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {links.map((link) => (
              <Link 
                key={link.href} 
                to={link.href} 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-corepulse-orange border-b-2 border-corepulse-orange"
                    : "text-corepulse-gray-600 hover:text-corepulse-orange hover:border-b-2 hover:border-corepulse-orange-light"
                }`}
              >
                {link.title}
              </Link>
            ))}
            <Button 
              className="ml-4 bg-corepulse-orange hover:bg-corepulse-orange-hover transition-colors flex items-center gap-2"
              onClick={() => connect()}
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnected ? formatAddress(address) : "Connect Wallet"}</span>
            </Button>
          </nav>

          {/* Mobile Navigation Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu} 
              className="text-corepulse-gray-700"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            {links.map((link) => (
              <Link 
                key={link.href} 
                to={link.href} 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.href)
                    ? "text-corepulse-orange bg-corepulse-gray-100"
                    : "text-corepulse-gray-600 hover:text-corepulse-orange hover:bg-corepulse-gray-100"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.title}
              </Link>
            ))}
            <div className="pt-2">
              <Button 
                className="w-full bg-corepulse-orange hover:bg-corepulse-orange-hover transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  connect();
                  setIsMenuOpen(false);
                }}
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnected ? formatAddress(address) : "Connect Wallet"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
