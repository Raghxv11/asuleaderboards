
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import SwipeCard from '@/components/SwipeCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Home = () => {
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
        <h1 className="text-4xl font-bold mb-4 gradient-text">
          Swipes Of Glory
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Swipe right if they're jacked, swipe left if not!
        </p>

        {currentProfile ? (
          <div className="flex justify-center">
            <SwipeCard 
              profile={currentProfile}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          </div>
        ) : noMoreProfiles ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">You've rated everyone!</h2>
            <p className="text-gray-600 mb-6">Check back later for more fitness enthusiasts to rate.</p>
            <Button asChild className="app-button">
              <Link to="/leaderboard">View Leaderboard</Link>
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Start Rating!</h2>
            <p className="text-gray-600 mb-6">
              {isLoggedIn 
                ? "Create your profile to be featured on the leaderboard."
                : "Sign in to create your profile and be featured on the leaderboard."}
            </p>
            {isLoggedIn ? (
              <Button asChild className="app-button">
                <Link to="/profile">Create Your Profile</Link>
              </Button>
            ) : (
              <Button className="app-button">Sign In</Button>
            )}
          </div>
        )}

        <div className="mt-16 bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-app-red to-app-purple flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold mb-2">Swipe Through Profiles</h3>
              <p className="text-gray-600">Rate fitness enthusiasts by swiping left or right</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-app-red to-app-purple flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">Upload your best fitness photo and get rated by others</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-app-red to-app-purple flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold mb-2">Climb the Ranks</h3>
              <p className="text-gray-600">See how you stack up on the leaderboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
