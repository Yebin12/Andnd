import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Camera, Upload, X, Loader2, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { profileHelpers } from "../../lib/supabase";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarChange?: (url: string) => void;
  size?: number;
  allowRemove?: boolean;
  showUploadButton?: boolean;
}

export function AvatarUpload({
  currentAvatarUrl,
  onAvatarChange,
  size = 80,
  allowRemove = true,
  showUploadButton = true,
}: AvatarUploadProps) {
  const { user, profile, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      const { data, error } = await profileHelpers.uploadAvatar(user.id, file);

      if (error) {
        console.error("Error uploading avatar:", error);
        alert("Failed to upload avatar. Please try again.");
        setPreviewUrl(null);
        return;
      }

      if (data && data.avatar_url) {
        onAvatarChange?.(data.avatar_url);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Failed to upload avatar. Please try again.");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    setUploading(true);
    try {
      const { data, error } = await updateProfile({ avatar_url: null });

      if (error) {
        console.error("Error removing avatar:", error);
        alert("Failed to remove avatar. Please try again.");
        return;
      }

      onAvatarChange?.("");
    } catch (error) {
      console.error("Failed to remove avatar:", error);
      alert("Failed to remove avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl = previewUrl || currentAvatarUrl || profile?.avatar_url;
  const displayName = profile?.display_name || "User";

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar
          className="cursor-pointer hover:opacity-80 transition-opacity"
          style={{ width: size, height: size }}
          onClick={triggerFileInput}
        >
          <AvatarImage src={avatarUrl || ""} alt="Profile" />
          <AvatarFallback style={{ fontSize: size / 4 }}>
            {displayName ? (
              getInitials(displayName)
            ) : (
              <User className="h-1/2 w-1/2" />
            )}
          </AvatarFallback>
        </Avatar>

        {/* Upload overlay */}
        <Button
          variant="outline"
          size="sm"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
          onClick={triggerFileInput}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Upload controls */}
      {showUploadButton && (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerFileInput}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>

          {allowRemove && avatarUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={uploading}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload instructions */}
      <p className="text-xs text-muted-foreground text-center max-w-[200px]">
        Click to upload a new avatar. Images should be square and less than 5MB.
      </p>
    </div>
  );
}
