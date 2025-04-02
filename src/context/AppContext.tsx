
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  bio: string;
  swipeRightReceived: number;
  totalVotes: number;
}

export interface UserProfile {
  id: string;
  name: string;
  imageUrl: string;
  bio?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  imageUrl: string;
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
  updateProfile: (data: { name: string; bio: string; imageFile: File | null }) => Promise<void>;
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
      const { data, error } = await supabase.rpc('get_leaderboard');
        
      if (error) throw error;
      
      if (data) {
        setLeaderboard(data.map(user => ({
          id: user.id,
          name: user.name,
          imageUrl: user.image_url || '',
          bio: user.bio || '',
          rank: user.rank,
          swipeRightPercentage: user.swipe_right_percentage,
          totalVotes: user.total_votes
        })));
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
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
  const updateProfile = async (data: { name: string; bio: string; imageFile: File | null }) => {
    if (!currentUser) return Promise.reject('Not logged in');
    
    setIsAuthLoading(true);
    
    try {
      let imageUrl = currentUser.imageUrl;
      
      // Upload new image if provided
      if (data.imageFile) {
        const fileExt = data.imageFile.name.split('.').pop();
        const filePath = `${supabaseUser?.id}/${Date.now()}.${fileExt}`;
        
        // Check if storage bucket exists, create if not
        const { data: bucketExists } = await supabase.storage.getBucket('profile-images');
        if (!bucketExists) {
          await supabase.storage.createBucket('profile-images', {
            public: true,
            fileSizeLimit: 1024 * 1024 * 2 // 2MB
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
          
        imageUrl = publicUrl.publicUrl;
      }
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          bio: data.bio,
          image_url: imageUrl
        })
        .eq('id', currentUser.id);
        
      if (error) throw error;
      
      // Update local user state
      setCurrentUser({
        ...currentUser,
        name: data.name,
        bio: data.bio,
        imageUrl: imageUrl
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
    if (!isLoggedIn) {
      toast.error('Please sign in to rate profiles');
      return;
    }
    
    try {
      // Record the swipe in the database
      await supabase
        .from('swipes')
        .insert([{
          voter_id: supabaseUser!.id,
          profile_id: userId,
          is_right_swipe: false
        }])
        .select();
        
      // Move to next profile
      setCurrentIndex(prev => prev + 1);
      
      // Refresh leaderboard data
      fetchLeaderboard();
    } catch (error: any) {
      console.error('Swipe left error:', error);
      // Check if it's a unique violation (already swiped)
      if (error.code === '23505') {
        toast.error('You have already rated this profile');
      } else {
        toast.error('Failed to record your vote');
      }
    }
  };

  const swipeRight = async (userId: string) => {
    if (!isLoggedIn) {
      toast.error('Please sign in to rate profiles');
      return;
    }
    
    try {
      // Record the swipe in the database
      await supabase
        .from('swipes')
        .insert([{
          voter_id: supabaseUser!.id,
          profile_id: userId,
          is_right_swipe: true
        }])
        .select();
        
      // Move to next profile
      setCurrentIndex(prev => prev + 1);
      
      // Refresh leaderboard data
      fetchLeaderboard();
    } catch (error: any) {
      console.error('Swipe right error:', error);
      // Check if it's a unique violation (already swiped)
      if (error.code === '23505') {
        toast.error('You have already rated this profile');
      } else {
        toast.error('Failed to record your vote');
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
