import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import ProfileForm from '@/components/ProfileForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Profile = () => {
  const { currentUser, isLoggedIn, updateProfile, isAuthLoading } = useApp();
  const navigate = useNavigate();
  
  // Redirect to home if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-extrabold gradient-text text-center mb-4">
          Your Profile
        </h1>
        <div className="gradient-divider w-32 mx-auto mb-8"></div>
        
        <div className="maroon-glass mb-10">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-gray-800">Edit Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {currentUser && (
              <ProfileForm
                initialData={{
                  name: currentUser.name,
                  bio: currentUser.bio,
                  imageUrl: currentUser.imageUrl,
                }}
                onSave={updateProfile}
                isLoading={isAuthLoading}
              />
            )}
          </CardContent>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center text-app-maroon">Your Stats</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="maroon-section text-center">
              <p className="text-sm mb-2 opacity-80">Right Swipes</p>
              <p className="text-3xl font-bold">
                {currentUser?.swipeRightReceived || 0}
              </p>
            </div>
            <div className="gold-section text-center">
              <p className="text-sm mb-2 opacity-80">Total Votes</p>
              <p className="text-3xl font-bold">
                {currentUser?.totalVotes || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 glass-container p-6 text-center">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Current Rating</h3>
          <div className="flex justify-center items-center space-x-4">
            <div className="text-5xl font-bold gradient-text">
              {currentUser?.swipeRightReceived && currentUser?.totalVotes 
                ? Math.round((currentUser.swipeRightReceived / currentUser.totalVotes) * 100) 
                : 0}%
            </div>
            <div className="text-gray-600">
              Jacked Rating
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
