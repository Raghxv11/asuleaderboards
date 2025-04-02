
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
        <h1 className="text-3xl font-bold gradient-text text-center mb-6">
          Your Profile
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Edit Your Profile</CardTitle>
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
        </Card>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-gray-600 text-sm">Right Swipes</p>
              <p className="text-2xl font-bold gradient-text">
                {currentUser?.swipeRightReceived || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-gray-600 text-sm">Total Votes</p>
              <p className="text-2xl font-bold gradient-text">
                {currentUser?.totalVotes || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
