import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PictureGalleryProps {
  pictures: string[];
  title: string;
}

export function PictureGallery({ pictures, title }: PictureGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  if (!pictures || pictures.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % pictures.length);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(selectedImageIndex === 0 ? pictures.length - 1 : selectedImageIndex - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  return (
    <>
      <div className="space-y-4">
        {/* Gallery Grid */}
        {pictures.length === 1 ? (
          // Single image - full width
          <div
            className="w-full h-64 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openLightbox(0)}
          >
            <ImageWithFallback
              src={pictures[0]}
              alt={`${title} - Image 1`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : pictures.length === 2 ? (
          // Two images - side by side
          <div className="grid grid-cols-2 gap-3">
            {pictures.map((picture, index) => (
              <div
                key={index}
                className="h-40 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(index)}
              >
                <ImageWithFallback
                  src={picture}
                  alt={`${title} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          // Three or more images - main image + grid
          <div className="space-y-3">
            {/* Main large image */}
            <div
              className="w-full h-64 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => openLightbox(0)}
            >
              <ImageWithFallback
                src={pictures[0]}
                alt={`${title} - Image 1`}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Smaller images grid */}
            <div className="grid grid-cols-3 gap-2">
              {pictures.slice(1, 4).map((picture, index) => (
                <div
                  key={index + 1}
                  className="relative h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openLightbox(index + 1)}
                >
                  <ImageWithFallback
                    src={picture}
                    alt={`${title} - Image ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Show count overlay for 4th image if there are more pictures */}
                  {index === 2 && pictures.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium">+{pictures.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 text-white z-10">
            <span className="text-sm">
              {selectedImageIndex + 1} of {pictures.length}
            </span>
          </div>

          {/* Navigation buttons */}
          {pictures.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Main image */}
          <div className="max-w-full max-h-full flex items-center justify-center">
            <ImageWithFallback
              src={pictures[selectedImageIndex]}
              alt={`${title} - Image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}