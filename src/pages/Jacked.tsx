import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import SwipeCard from '@/components/SwipeCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Jacked = () => {
  const { getNextProfile, swipeLeft, swipeRight, isLoggedIn, users, currentUser } = useApp();
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  const [anonymousSwipeCount, setAnonymousSwipeCount] = useState(0);
  const [seenProfileIds, setSeenProfileIds] = useState(new Set<string>());
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  
  // On initial load, get the first profile
  useEffect(() => {
    if (users.length > 0 && !currentProfile) {
      const nextUnseen = getNextUnseenProfile();
      setCurrentProfile(nextUnseen);
    }
  }, [users]);
  
  // Reset anonymous swipe count when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      setAnonymousSwipeCount(0);
    }
  }, [isLoggedIn]);

  // Function to get the next unseen profile
  const getNextUnseenProfile = () => {
    // Log current state for debugging
    console.log('Seen profiles:', Array.from(seenProfileIds));
    console.log('Current user:', currentUser?.id);
    console.log('Available profiles (all):', users.map(u => u.id));
    
    const availableProfiles = users.filter(user => {
      // Skip if we've already seen this profile
      if (seenProfileIds.has(user.id)) {
        console.log(`Filtering out seen profile: ${user.id}`);
        return false;
      }
      
      // Skip if this is the current logged-in user
      if (currentUser && user.id === currentUser.id) {
        console.log(`Filtering out current user: ${user.id}`);
        return false;
      }
      
      return true;
    });
    
    console.log('Available profiles (filtered):', availableProfiles.map(u => u.id));
    
    if (availableProfiles.length === 0) {
      return null;
    }
    
    return availableProfiles[0];
  };
  
  const handleSwipeLeft = () => {
    if (currentProfile) {
      // Track anonymous swipes and show a message after a few swipes
      if (!isLoggedIn) {
        const newCount = anonymousSwipeCount + 1;
        setAnonymousSwipeCount(newCount);
        
        if (newCount === 3) {
          toast.info("Sign in to have your votes count on the leaderboard!");
        }
      }
      
      // Record the swipe
      swipeLeft(currentProfile.id);
      
      // Mark this profile as seen
      setSeenProfileIds(prev => {
        const newSet = new Set(prev);
        newSet.add(currentProfile.id);
        return newSet;
      });
      
      // Find the next unseen profile
      const nextUnseen = getNextUnseenProfile();
      
      if (nextUnseen) {
        setCurrentProfile(nextUnseen);
      } else {
        setNoMoreProfiles(true);
        setCurrentProfile(null);
      }
    }
  };

  const handleSwipeRight = () => {
    if (currentProfile) {
      // Track anonymous swipes and show a message after a few swipes
      if (!isLoggedIn) {
        const newCount = anonymousSwipeCount + 1;
        setAnonymousSwipeCount(newCount);
        
        if (newCount === 3) {
          toast.info("Sign in to have your votes count on the leaderboard!");
        }
      }
      
      // Record the swipe
      swipeRight(currentProfile.id);
      
      // Mark this profile as seen
      setSeenProfileIds(prev => {
        const newSet = new Set(prev);
        newSet.add(currentProfile.id);
        return newSet;
      });
      
      // Find the next unseen profile
      const nextUnseen = getNextUnseenProfile();
      
      if (nextUnseen) {
        setCurrentProfile(nextUnseen);
      } else {
        setNoMoreProfiles(true);
        setCurrentProfile(null);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 gradient-text">
          Who's More Jacked
        </h1>
        <div className="gradient-divider w-24 md:w-32 mx-auto mb-4 md:mb-6"></div>
        <p className="text-lg md:text-xl text-gray-700 mb-8 md:mb-16 max-w-xl mx-auto px-2">
          Swipe right if they're jacked, swipe left if not!
        </p>

        {currentProfile ? (
          <div className="flex justify-center mb-8 md:mb-16">
            <SwipeCard 
              profile={currentProfile}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          </div>
        ) : noMoreProfiles ? (
          <div className="maroon-glass text-center py-8 md:py-12 px-4 md:px-8 mb-8 md:mb-16">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800">You've rated everyone!</h2>
            <p className="text-gray-600 mb-6 md:mb-8">Check back later for more fitness enthusiasts to rate.</p>
            <Button asChild className="gold-button">
              <Link to="/leaderboard">View Leaderboard</Link>
            </Button>
          </div>
        ) : (
          <div className="glass-container text-center py-8 md:py-12 px-4 md:px-8 mb-8 md:mb-16">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800">Start Rating!</h2>
            <p className="text-gray-600 mb-6 md:mb-8">
              {isLoggedIn 
                ? " Create your profile to be featured on the leaderboard."
                : " Sign in to create your own profile and be featured on the leaderboard."}
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
              <Button asChild className="maroon-button">
                <Link to="/leaderboard">View Leaderboard</Link>
              </Button>
              {isLoggedIn ? (
                <Button asChild className="gold-button mt-3 sm:mt-0">
                  <Link to="/profile">Create Your Profile</Link>
                </Button>
              ) : (
                <Button asChild className="gold-button mt-3 sm:mt-0">
                  <Link to="/leaderboard">See Who's Jacked!</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jacked; 