import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import LeaderboardTable from '@/components/LeaderboardTable';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Leaderboard = () => {
  const { leaderboard, isDataLoading, isLoggedIn } = useApp();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-4">
            Who's More Jacked
          </h1>
          <div className="gradient-divider w-32 mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 max-w-xl mx-auto">
            See who's ranked by their "jacked" rating percentage
          </p>
        </div>
        
        <div className="mb-6 text-center">
          <Button asChild className="maroon-button">
            <Link to="/">Back to Categories</Link>
          </Button>
        </div>
        
        <div className="mb-10 bg-gradient-to-r from-app-maroon via-app-gold to-app-gold p-8 rounded-2xl" style={{backgroundSize: '200% 100%', backgroundPosition: '75% 0'}}>
          <h2 className="text-2xl font-bold mb-6 text-white">Top Performers</h2>
          <div className="glass-container overflow-hidden">
            <LeaderboardTable users={leaderboard} isLoading={isDataLoading} />
          </div>
          <p className="text-sm mt-4 opacity-80 text-white">
            Rankings are calculated based on the percentage of right swipes received
          </p>
        </div>
        
        <div className="mt-8 text-center">
          {!isLoggedIn && (
            <div className="maroon-section mt-6">
              <h3 className="text-2xl font-bold mb-4">Want to be on the leaderboard?</h3>
              <p className="mb-8 max-w-lg mx-auto">
                Sign in to create your profile and get rated by the community!
              </p>
              <Button asChild className="gold-button">
                <Link to="/jacked">Start Rating</Link>
              </Button>
            </div>
          )}
          
          {isLoggedIn && (
            <div className="glass-container mt-6 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Improve Your Ranking</h3>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Update your profile to showcase your fitness journey and improve your standing!
              </p>
              <div className="space-x-4">
                <Button asChild className="app-button">
                  <Link to="/profile">Update Profile</Link>
                </Button>
                <Button asChild className="gold-button">
                  <Link to="/jacked">Rate Others</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
