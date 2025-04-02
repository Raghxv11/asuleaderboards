
import React from 'react';
import { Button } from '@/components/ui/button';

interface UserProfile {
  id: string;
  name: string;
  imageUrl: string;
  bio?: string;
}

interface SwipeCardProps {
  profile: UserProfile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipeLeft, onSwipeRight }) => {
  const [direction, setDirection] = React.useState<'left' | 'right' | null>(null);

  const handleSwipe = (dir: 'left' | 'right') => {
    setDirection(dir);
    setTimeout(() => {
      if (dir === 'left') {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
      setDirection(null);
    }, 500); // Match animation duration
  };

  const cardClassName = `swipe-card ${
    direction === 'left' 
      ? 'animate-slide-left' 
      : direction === 'right' 
        ? 'animate-slide-right' 
        : ''
  }`;

  return (
    <div className="card-container">
      <div className={cardClassName}>
        <div className="relative h-full">
          <img 
            src={profile.imageUrl} 
            alt={profile.name}
            className="w-full h-3/4 object-cover"
          />
          <div className="absolute bottom-0 w-full p-4 bg-white">
            <h3 className="text-xl font-bold">{profile.name}</h3>
            <p className="text-gray-600 line-clamp-2">{profile.bio || "No bio available"}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center gap-8">
        <Button 
          onClick={() => handleSwipe('left')} 
          variant="outline" 
          className="rounded-full h-16 w-16 border-2 border-app-red flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8 text-app-red">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
        <Button 
          onClick={() => handleSwipe('right')} 
          variant="outline" 
          className="rounded-full h-16 w-16 border-2 border-green-500 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8 text-green-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default SwipeCard;
