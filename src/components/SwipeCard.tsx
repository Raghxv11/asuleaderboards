import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface UserProfile {
  id: string;
  name: string;
  imageUrl: string;
  imageUrls?: string[];
  bio?: string;
}

interface SwipeCardProps {
  profile: UserProfile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipeLeft, onSwipeRight }) => {
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get all images, falling back to the primary image if imageUrls is not available
  const images = profile.imageUrls?.length 
    ? profile.imageUrls 
    : [profile.imageUrl].filter(Boolean);

  const handleSwipe = (dir: 'left' | 'right') => {
    setDirection(dir);
    setTimeout(() => {
      if (dir === 'left') {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
      setDirection(null);
      // Reset image index for the next profile
      setCurrentImageIndex(0);
    }, 500); // Match animation duration
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
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
          {/* Current image */}
          <div className="relative w-full h-3/4">
            <img 
              src={images[currentImageIndex]} 
              alt={`${profile.name} - Photo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Image navigation controls */}
            {images.length > 1 && (
              <>
                {/* Left arrow */}
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors"
                  disabled={direction !== null}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Right arrow */}
                <button 
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors"
                  disabled={direction !== null}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Image position indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="absolute bottom-0 w-full p-4 bg-white border-t-2 border-app-gold">
            <h3 className="text-xl font-bold text-app-maroon">{profile.name}</h3>
            <p className="text-gray-600 line-clamp-2">{profile.bio || "No bio available"}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center gap-8">
        <Button 
          onClick={() => handleSwipe('left')} 
          variant="outline" 
          className="rounded-full h-16 w-16 border-2 border-app-maroon flex items-center justify-center"
          disabled={direction !== null}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8 text-app-maroon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
        <Button 
          onClick={() => handleSwipe('right')} 
          variant="outline" 
          className="rounded-full h-16 w-16 border-2 border-app-gold flex items-center justify-center"
          disabled={direction !== null}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8 text-app-gold">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default SwipeCard;
