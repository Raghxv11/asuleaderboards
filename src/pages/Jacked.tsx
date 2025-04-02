import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import SwipeCard from '@/components/SwipeCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Jacked = () => {
  const { getNextProfile, swipeLeft, swipeRight, isLoggedIn } = useApp();
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(getNextProfile());

  const handleSwipeLeft = () => {
    if (currentProfile) {
      swipeLeft(currentProfile.id);
      const nextProfile = getNextProfile();
      if (nextProfile) {
        setCurrentProfile(nextProfile);
      } else {
        setNoMoreProfiles(true);
        setCurrentProfile(null);
      }
    }
  };

  const handleSwipeRight = () => {
    if (currentProfile) {
      swipeRight(currentProfile.id);
      const nextProfile = getNextProfile();
      if (nextProfile) {
        setCurrentProfile(nextProfile);
      } else {
        setNoMoreProfiles(true);
        setCurrentProfile(null);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-6 gradient-text">
          Who's More Jacked
        </h1>
        <div className="gradient-divider w-32 mx-auto mb-6"></div>
        <p className="text-xl text-gray-700 mb-16 max-w-xl mx-auto">
          Swipe right if they're jacked, swipe left if not!
        </p>

        {currentProfile ? (
          <div className="flex justify-center mb-16">
            <SwipeCard 
              profile={currentProfile}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          </div>
        ) : noMoreProfiles ? (
          <div className="maroon-glass text-center py-12 px-8 mb-16">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">You've rated everyone!</h2>
            <p className="text-gray-600 mb-8">Check back later for more fitness enthusiasts to rate.</p>
            <Button asChild className="gold-button">
              <Link to="/leaderboard">View Leaderboard</Link>
            </Button>
          </div>
        ) : (
          <div className="glass-container text-center py-12 px-8 mb-16">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Start Rating!</h2>
            <p className="text-gray-600 mb-8">
              Swipe through profiles to rate fitness enthusiasts.
              {isLoggedIn 
                ? " Create your profile to be featured on the leaderboard."
                : " Sign in to create your profile and be featured on the leaderboard."}
            </p>
            <div className="space-x-4">
              <Button asChild className="maroon-button">
                <Link to="/leaderboard">View Leaderboard</Link>
              </Button>
              {isLoggedIn ? (
                <Button asChild className="gold-button">
                  <Link to="/profile">Create Your Profile</Link>
                </Button>
              ) : (
                <Button className="app-button">Sign In</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jacked; 