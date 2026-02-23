
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState('taxi');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          initial={{ y: 0 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-40 bg-[#0A1F44] shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-3">
                <img
                  src="https://horizons-cdn.hostinger.com/e8f6b00a-c812-4137-bd6b-eb48e6d9f68c/5dfe490ac2b629c947a318c1e53fe5df.jpg"
                  alt="TP - Taxi Pet Logo"
                  className="h-10 w-auto"
                />
                <span className="text-white font-bold text-xl hidden sm:block">TP - Taxi Pet</span>
              </Link>

              <div className="flex items-center space-x-1 bg-[#0A1F44]/50 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('taxi')}
                  className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${
                    activeTab === 'taxi'
                      ? 'bg-[#FFC107] text-[#0A1F44]'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  🚕 Taxi
                </button>
                <button
                  onClick={() => setActiveTab('mercadinho')}
                  className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${
                    activeTab === 'mercadinho'
                      ? 'bg-[#FFC107] text-[#0A1F44]'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  🛒 Mercadinho
                </button>
              </div>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
};

export default Header;
