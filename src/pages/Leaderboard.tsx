
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
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Jacked Leaderboard
          </h1>
          <p className="text-gray-600">
            See who's ranked by their "jacked" rating percentage
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <LeaderboardTable users={leaderboard} isLoading={isDataLoading} />
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Rankings are calculated based on the percentage of right swipes received
          </p>
          
          {!isLoggedIn && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Want to be on the leaderboard?</h3>
              <p className="text-gray-600 mb-4">
                Sign in to create your profile and get rated by the community!
              </p>
              <Button asChild className="app-button">
                <Link to="/">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
