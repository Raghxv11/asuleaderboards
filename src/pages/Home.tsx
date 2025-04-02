import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Home = () => {
  const { isLoggedIn } = useApp();

  useEffect(() => {
    // Add a subtle parallax effect to the background
    const handleMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
      document.body.style.backgroundPosition = `${moveX}px ${moveY}px`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <motion.div 
        className="text-center max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1 
          className="text-6xl font-extrabold mb-6 gradient-text"
          variants={itemVariants}
        >
          ASU Leaderboards
        </motion.h1>
        
        <motion.div 
          className="gradient-divider w-32 mx-auto mb-6"
          variants={itemVariants}
        ></motion.div>
        
        {/* <motion.p 
          className="text-xl text-gray-700 mb-16 max-w-xl mx-auto"
          variants={itemVariants}
        >
          Rate and compete in different categories within the ASU community
        </motion.p> */}

        <motion.div 
          className="glass-container text-center py-12 px-8 mb-16 relative overflow-hidden"
          variants={itemVariants}
          whileHover={{ boxShadow: "0 15px 30px rgba(0,0,0,0.15)" }}
        >
          {/* Background accent circles */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-app-gold opacity-10"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-app-maroon opacity-10"></div>
          
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Choose a Category</h2>
          
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
            <motion.div 
              className="maroon-glass p-8 rounded-xl relative z-10 overflow-hidden"
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-app-maroon opacity-10 rounded-bl-full"></div>
              <h3 className="text-2xl font-bold mb-3">Who's More Jacked</h3>
              <p className="text-gray-600 mb-6">
                Swipe right if they're jacked, left if not.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild className="gold-button">
                  <Link to="/jacked">Start Rating</Link>
                </Button>
                {/* <Button asChild className="maroon-button">
                  <Link to="/leaderboard">View Leaderboard</Link>
                </Button> */}
              </div>
            </motion.div>
            
            <motion.div 
              className="gold-glass p-8 rounded-xl relative z-10 overflow-hidden opacity-90"
              whileHover={{ scale: 1.03, opacity: 1, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-app-gold opacity-20 rounded-bl-full"></div>
              <h3 className="text-2xl font-bold mb-3">Who's More Cracked</h3>
              <p className="text-gray-600 mb-6">
                Coming soon! Rate ASU gamers based on their skills. Who has the best aim and reflexes?
              </p>
              <Button disabled className="app-button opacity-50 hover:opacity-50">
                Coming Soon
              </Button>
            </motion.div>
            
            <motion.div 
              className="maroon-glass p-8 rounded-xl relative z-10 overflow-hidden opacity-90"
              whileHover={{ scale: 1.03, opacity: 1, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-app-maroon opacity-20 rounded-bl-full"></div>
              <h3 className="text-2xl font-bold mb-3">More Categories</h3>
              <p className="text-gray-600 mb-6">
                Additional categories will be added soon! Stay tuned for new ways to compete and rate your peers.
              </p>
              <Button disabled className="app-button opacity-50 hover:opacity-50">
                Coming Soon
              </Button>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          className="mt-20"
          variants={itemVariants}
        >
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              className="maroon-section relative overflow-hidden"
              whileHover={{ y: -5, boxShadow: "0 12px 24px rgba(0,0,0,0.15)" }}
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full"></div>
              <h2 className="text-2xl font-bold mb-4">Top Performers</h2>
              <p className="mb-6">Check out the current standings across all categories!</p>
              <Button asChild className="gold-button">
                <Link to="/leaderboard">View Leaderboards</Link>
              </Button>
            </motion.div>
            
            <motion.div 
              className="gold-section relative overflow-hidden"
              whileHover={{ y: -5, boxShadow: "0 12px 24px rgba(0,0,0,0.15)" }}
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
              <h2 className="text-2xl font-bold mb-4">Join the Competition</h2>
              <p className="mb-6">Create your profile and participate in various ASU community ratings!</p>
              {isLoggedIn ? (
                <Button asChild className="maroon-button">
                  <Link to="/profile">Manage Profile</Link>
                </Button>
              ) : (
                <Button className="gold-button">Sign In</Button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
