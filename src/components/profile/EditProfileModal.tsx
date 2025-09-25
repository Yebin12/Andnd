import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Camera, User, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { profileHelpers } from "../../lib/supabase";
import type { Profile, ProfileFormData } from "../../types/profile";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: Profile;
  onProfileUpdate?: (profile: Profile) => void;
}

export function EditProfileModal({
  open,
  onOpenChange,
  currentProfile,
  onProfileUpdate,
}: EditProfileModalProps) {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [formData, setFormData] = useState<ProfileFormData>({
    username: currentProfile.username || "",
    display_name: currentProfile.display_name || "",
    bio: currentProfile.bio || "",
    location: currentProfile.location || "",
    website: currentProfile.website || "",
    date_of_birth: currentProfile.date_of_birth || "",
    profile_visibility: currentProfile.profile_visibility,
    show_email: currentProfile.show_email,
    show_phone: currentProfile.show_phone,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData({
        username: currentProfile.username || "",
        display_name: currentProfile.display_name || "",
        bio: currentProfile.bio || "",
        location: currentProfile.location || "",
        website: currentProfile.website || "",
        date_of_birth: currentProfile.date_of_birth || "",
        profile_visibility: currentProfile.profile_visibility,
        show_email: currentProfile.show_email,
        show_phone: currentProfile.show_phone,
      });
      setErrors({});
      setUsernameAvailable(null);
    }
  }, [open, currentProfile]);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username === currentProfile.username) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameLoading(true);
    try {
      const { available, error } =
        await profileHelpers.checkUsernameAvailability(
          username,
          currentProfile.id
        );
      setUsernameAvailable(available);
      if (!available && !error) {
        setErrors((prev) => ({
          ...prev,
          username: "Username is already taken",
        }));
      } else if (available) {
        setErrors((prev) => ({ ...prev, username: "" }));
      }
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setUsernameLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.username && formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (formData.display_name && formData.display_name.length > 100) {
      newErrors.display_name = "Display name must be less than 100 characters";
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    if (formData.website && formData.website) {
      try {
        new URL(formData.website);
      } catch {
        newErrors.website = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (usernameAvailable === false) {
      return;
    }

    setLoading(true);
    try {
      const updates: Partial<Profile> = {};

      // Only include changed fields
      if (formData.username !== currentProfile.username)
        updates.username = formData.username;
      if (formData.display_name !== currentProfile.display_name)
        updates.display_name = formData.display_name;
      if (formData.bio !== currentProfile.bio) updates.bio = formData.bio;
      if (formData.location !== currentProfile.location)
        updates.location = formData.location;
      if (formData.website !== currentProfile.website)
        updates.website = formData.website;
      if (formData.date_of_birth !== currentProfile.date_of_birth)
        updates.date_of_birth = formData.date_of_birth;
      if (formData.profile_visibility !== currentProfile.profile_visibility)
        updates.profile_visibility = formData.profile_visibility;
      if (formData.show_email !== currentProfile.show_email)
        updates.show_email = formData.show_email;
      if (formData.show_phone !== currentProfile.show_phone)
        updates.show_phone = formData.show_phone;

      const { data, error } = await updateProfile(updates);

      if (error) {
        console.error("Error updating profile:", error);
        // Handle specific error cases
        if (error.message.includes("username")) {
          setErrors({ username: "Username is already taken" });
        }
        return;
      }

      if (data && onProfileUpdate) {
        onProfileUpdate(data);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={currentProfile.avatar_url || ""}
                  alt="Profile"
                />
                <AvatarFallback>
                  {currentProfile.display_name ? (
                    getInitials(currentProfile.display_name)
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h3 className="font-medium">Profile Picture</h3>
              <p className="text-sm text-muted-foreground">
                Click the camera icon to upload a new picture
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({ ...prev, username: value }));
                    if (value !== currentProfile.username) {
                      checkUsernameAvailability(value);
                    }
                  }}
                  placeholder="Enter username"
                  className={errors.username ? "border-red-500" : ""}
                />
                {usernameLoading && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                )}
              </div>
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
              {usernameAvailable === true && (
                <p className="text-sm text-green-500">Username is available</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_name: e.target.value,
                  }))
                }
                placeholder="Enter display name"
                className={errors.display_name ? "border-red-500" : ""}
              />
              {errors.display_name && (
                <p className="text-sm text-red-500">{errors.display_name}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Tell us about yourself..."
              rows={3}
              className={errors.bio ? "border-red-500" : ""}
            />
            <div className="flex justify-between items-center">
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio}</p>
              )}
              <p className="text-sm text-muted-foreground ml-auto">
                {formData.bio.length}/500
              </p>
            </div>
          </div>

          {/* Location and Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
                placeholder="https://example.com"
                className={errors.website ? "border-red-500" : ""}
              />
              {errors.website && (
                <p className="text-sm text-red-500">{errors.website}</p>
              )}
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  date_of_birth: e.target.value,
                }))
              }
            />
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Privacy Settings</h3>

            <div className="space-y-2">
              <Label htmlFor="profile_visibility">Profile Visibility</Label>
              <Select
                value={formData.profile_visibility}
                onValueChange={(value: "public" | "friends" | "private") =>
                  setFormData((prev) => ({
                    ...prev,
                    profile_visibility: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show_email">Show Email Address</Label>
              <Switch
                id="show_email"
                checked={formData.show_email}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, show_email: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show_phone">Show Phone Number</Label>
              <Switch
                id="show_phone"
                checked={formData.show_phone}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, show_phone: checked }))
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || usernameAvailable === false}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
