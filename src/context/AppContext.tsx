import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  imageUrls: string[];
  bio: string;
  swipeRightReceived: number;
  totalVotes: number;
}

export interface UserProfile {
  id: string;
  name: string;
  imageUrl: string;
  imageUrls?: string[];
  bio?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  imageUrl: string;
  imageUrls?: string[];
  bio?: string;
  rank: number;
  swipeRightPercentage: number;
  totalVotes: number;
}

interface AppContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  isDataLoading: boolean;
  users: UserProfile[];
  leaderboard: LeaderboardUser[];
  login: (email: string, password: string) => void;
  signUp: (email: string, password: string, name: string) => void;
  logout: () => void;
  updateProfile: (data: { 
    name: string; 
    bio: string; 
    imageFile: File | null; 
    imageFiles: File[];
    imageUrls: string[];
    deletedImageUrls: string[];
  }) => Promise<void>;
  swipeLeft: (userId: string) => void;
  swipeRight: (userId: string) => void;
  getNextProfile: () => UserProfile | null;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Initialize auth state from Supabase
  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        setIsLoggedIn(!!currentSession);
        
        // Defer profile data loading with setTimeout to prevent deadlock
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setCurrentUser(null);
        }
      }
    );
    
    // Check for initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setSupabaseUser(currentSession?.user ?? null);
      setIsLoggedIn(!!currentSession);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
    });
    
    // Load profiles and leaderboard data
    fetchProfiles();
    fetchLeaderboard();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (profile) {
        // Get swipe statistics for the user
        const { data: swipeStats, error: swipeError } = await supabase
          .from('swipes')
          .select('is_right_swipe')
          .eq('profile_id', userId);
          
        if (swipeError) throw swipeError;
        
        const swipeRightReceived = swipeStats?.filter(s => s.is_right_swipe).length || 0;
        const totalVotes = swipeStats?.length || 0;
        
        setCurrentUser({
          id: profile.id,
          name: profile.name,
          email: supabaseUser?.email || '',
          imageUrl: profile.image_url || '',
          imageUrls: profile.image_urls || [profile.image_url].filter(Boolean),
          bio: profile.bio || '',
          swipeRightReceived,
          totalVotes
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  
  // Fetch all profiles from Supabase
  const fetchProfiles = async () => {
    setIsDataLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) throw error;
      
      if (data) {
        setUsers(data.map(profile => ({
          id: profile.id,
          name: profile.name,
          imageUrl: profile.image_url || '',
          imageUrls: profile.image_urls || [profile.image_url].filter(Boolean),
          bio: profile.bio || ''
        })));
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to load profiles');
    } finally {
      setIsDataLoading(false);
    }
  };
  
  // Fetch leaderboard data using our custom SQL function
  const fetchLeaderboard = async () => {
    setIsDataLoading(true);
    try {
      // Debug: First check if there are swipes in the database
      const { data: swipeCheck, error: swipeError } = await supabase
        .from('swipes')
        .select('*')
        .limit(10);
        
      if (swipeError) {
        console.error('Error checking swipes:', swipeError);
      } else {
        console.log('Swipes in database:', swipeCheck?.length || 0);
      }
      
      // Now get the leaderboard data
      const { data, error } = await supabase.rpc('get_leaderboard');
        
      if (error) {
        console.error('Leaderboard function error:', error);
        throw error;
      }
      
      console.log('Leaderboard data received:', data?.length || 0);
      
      if (data) {
        setLeaderboard(data.map(user => ({
          id: user.id,
          name: user.name,
          imageUrl: user.image_url || '',
          imageUrls: user.image_urls || [],
          bio: user.bio || '',
          rank: user.rank,
          swipeRightPercentage: user.swipe_right_percentage,
          totalVotes: user.total_votes
        })));
        
      }
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard: ' + error.message);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Authentication methods
  const login = async (email: string, password: string) => {
    setIsAuthLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success('Logged in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
      console.error('Login error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string, name: string) => {
    setIsAuthLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
      console.error('Signup error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };
  
  const logout = async () => {
    setIsAuthLoading(true);
    try {
      await supabase.auth.signOut();
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Profile update
  const updateProfile = async (data: { 
    name: string; 
    bio: string; 
    imageFile: File | null; 
    imageFiles: File[];
    imageUrls: string[];
    deletedImageUrls: string[];
  }) => {
    if (!currentUser) return Promise.reject('Not logged in');
    
    setIsAuthLoading(true);
    
    try {
      let imageUrl = currentUser.imageUrl;
      let imageUrls = data.imageUrls || [];
      
      // Delete images that were marked for deletion
      for (const urlToDelete of data.deletedImageUrls) {
        // Extract the path from the URL
        const pathMatch = urlToDelete.match(/\/profile-images\/(.+)$/);
        if (pathMatch && pathMatch[1]) {
          const filePath = decodeURIComponent(pathMatch[1]);
          await supabase.storage
            .from('profile-images')
            .remove([filePath]);
        }
      }
      
      // Handle single image upload for backward compatibility
      if (data.imageFile) {
        const fileExt = data.imageFile.name.split('.').pop();
        const filePath = `${supabaseUser?.id}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        // Create storage bucket if it doesn't exist (reuse the bucket created above)
        try {
          const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('profile-images');
          
          if (bucketError) {
            // Create the bucket if it doesn't exist
            await supabase.storage.createBucket('profile-images', {
              public: true,
              fileSizeLimit: 1024 * 1024 * 5 // 5MB
            });
          }
        } catch (error) {
          console.log('Creating bucket:', error);
          // Create the bucket if there was an error checking
          await supabase.storage.createBucket('profile-images', {
            public: true,
            fileSizeLimit: 1024 * 1024 * 5 // 5MB
          });
        }
        
        // Upload the file
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('profile-images')
          .upload(filePath, data.imageFile);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicUrl } = supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath);
          
        imageUrls.push(publicUrl.publicUrl);
      }
      
      // Upload new images from the array
      for (const file of data.imageFiles) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${supabaseUser?.id}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        // Bucket should already be created by now, but just in case
        try {
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('profile-images')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: publicUrl } = supabase.storage
            .from('profile-images')
            .getPublicUrl(filePath);
            
          imageUrls.push(publicUrl.publicUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error(`Failed to upload image: ${file.name}`);
        }
      }
      
      // Set the primary image URL to the first image in the array or keep existing
      imageUrl = imageUrls.length > 0 ? imageUrls[0] : imageUrl;
      
      // Make sure there are no duplicates in imageUrls
      const uniqueImageUrls = [...new Set(imageUrls)];
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          bio: data.bio,
          image_url: imageUrl,
          image_urls: uniqueImageUrls
        })
        .eq('id', currentUser.id);
        
      if (error) throw error;
      
      // Update local user state
      setCurrentUser({
        ...currentUser,
        name: data.name,
        bio: data.bio,
        imageUrl: imageUrl,
        imageUrls: uniqueImageUrls
      });
      
      // Refresh profiles list
      await fetchProfiles();
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      console.error('Profile update error:', error);
      return Promise.reject(error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Swipe functionality
  const swipeLeft = async (userId: string) => {
    try {
      // Generate a valid UUID for anonymous users
      const anonymousId = isLoggedIn ? supabaseUser!.id : crypto.randomUUID();
      
      // Record the swipe in the database 
      const { data, error } = await supabase
        .from('swipes')
        .insert([{
          voter_id: anonymousId,
          profile_id: userId,
          is_right_swipe: false
        }])
        .select();
        
      if (error) throw error;
      
      if (!isLoggedIn) {
        toast.success('Vote recorded!'); // Debug toast
      }
        
      // Move to next profile
      setCurrentIndex(prev => prev + 1);
      
      // Refresh leaderboard data
      setTimeout(() => {
        fetchLeaderboard();
      }, 500); // Add a small delay to ensure the database has processed the insert
    } catch (error: any) {
      console.error('Swipe left error:', error);
      // Check if it's a unique violation (already swiped)
      if (error.code === '23505') {
        toast.error('You have already rated this profile');
      } else {
        toast.error('Failed to record your vote: ' + error.message);
      }
    }
  };

  const swipeRight = async (userId: string) => {
    try {
      // Generate a valid UUID for anonymous users
      const anonymousId = isLoggedIn ? supabaseUser!.id : crypto.randomUUID();
      
      // Record the swipe in the database
      const { data, error } = await supabase
        .from('swipes')
        .insert([{
          voter_id: anonymousId,
          profile_id: userId,
          is_right_swipe: true
        }])
        .select();
        
      if (error) throw error;
      
      if (!isLoggedIn) {
        toast.success('Vote recorded!'); // Debug toast
      }
        
      // Move to next profile
      setCurrentIndex(prev => prev + 1);
      
      // Refresh leaderboard data
      setTimeout(() => {
        fetchLeaderboard();
      }, 500); // Add a small delay to ensure the database has processed the insert
    } catch (error: any) {
      console.error('Swipe right error:', error);
      // Check if it's a unique violation (already swiped)
      if (error.code === '23505') {
        toast.error('You have already rated this profile');
      } else {
        toast.error('Failed to record your vote: ' + error.message);
      }
    }
  };

  const getNextProfile = (): UserProfile | null => {
    // Filter out the current user and profiles we've already swiped on
    const filteredUsers = users.filter(u => 
      currentUser ? u.id !== currentUser.id : true
    );
    
    if (currentIndex >= filteredUsers.length) {
      return null;
    }
    
    return filteredUsers[currentIndex];
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      isLoggedIn,
      isAuthLoading,
      isDataLoading,
      users,
      leaderboard,
      login,
      signUp,
      logout,
      updateProfile,
      swipeLeft,
      swipeRight,
      getNextProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
