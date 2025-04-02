import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ProfileFormProps {
  initialData?: {
    name: string;
    bio: string;
    imageUrl: string;
    imageUrls?: string[];
  };
  onSave: (profileData: { 
    name: string; 
    bio: string; 
    imageFile: File | null; 
    imageFiles: File[];
    imageUrls: string[];
    deletedImageUrls: string[];
  }) => void;
  isLoading?: boolean;
}

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSave, isLoading = false }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [bio, setBio] = useState(initialData?.bio || '');
  
  // Single image backward compatibility
  const initialImageUrls = initialData?.imageUrls || 
    (initialData?.imageUrl ? [initialData.imageUrl] : []);
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialImageUrls);
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    
    if (files.length + imagePreviews.length - deletedImageUrls.length > MAX_IMAGES) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images`);
      return;
    }
    
    // Validate each file
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Image ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      
      if (!file.type.match('image.*')) {
        toast.error(`File ${file.name} is not an image`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Add the valid files to state
    setImageFiles(prev => [...prev, ...validFiles]);
    
    // Create previews for the new files
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteImage = (index: number) => {
    // If it's an existing image URL, mark it for deletion
    if (index < initialImageUrls.length) {
      const imageUrl = initialImageUrls[index];
      setDeletedImageUrls(prev => [...prev, imageUrl]);
    }
    
    // Calculate the corresponding index in the imageFiles array
    const fileIndex = index - initialImageUrls.length;
    if (fileIndex >= 0) {
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
    
    // Remove from previews
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please provide a name");
      return;
    }
    
    const remainingImageCount = imagePreviews.length;
    
    if (remainingImageCount === 0) {
      toast.error("Please upload at least one profile image");
      return;
    }
    
    onSave({
      name: name.trim(),
      bio: bio.trim(),
      imageFile: null, // Keep for backward compatibility
      imageFiles,
      imageUrls: initialImageUrls.filter(url => !deletedImageUrls.includes(url)),
      deletedImageUrls
    });
  };

  const filteredImagePreviews = imagePreviews.filter(
    (_, index) => 
      !(index < initialImageUrls.length && deletedImageUrls.includes(initialImageUrls[index]))
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center mb-8">
        <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-4">
          {filteredImagePreviews.map((preview, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={preview}
                alt={`Profile Image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border-2 border-primary"
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                disabled={isLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
          
          {filteredImagePreviews.length < MAX_IMAGES && (
            <label 
              htmlFor="profile-images"
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
            >
              <div className="flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-8 h-8 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-xs text-gray-500 mt-1">Add Image</span>
              </div>
            </label>
          )}
        </div>
        
        <Input
          id="profile-images"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          multiple
          disabled={isLoading || filteredImagePreviews.length >= MAX_IMAGES}
        />
        
        <p className="text-sm text-gray-500">Upload up to {MAX_IMAGES} of your best fitness photos</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1">
            Bio
          </label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about your fitness journey"
            rows={4}
            disabled={isLoading}
          />
        </div>
      </div>

      <Button type="submit" className="app-button w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
};

export default ProfileForm;
