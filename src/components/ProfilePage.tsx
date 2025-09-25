import { useState, useEffect } from "react";
import { ArrowLeft, Camera, Edit2, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "../contexts/AuthContext";

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username:
      profile?.username ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "User",
    email: user?.email || "",
    phoneNumber: user?.user_metadata?.phone || "",
    birthday: profile?.date_of_birth || user?.user_metadata?.birthday || "",
    profilePicture:
      profile?.avatar_url || user?.user_metadata?.avatar_url || "",
  });

  // Update profile data when profile or user changes
  useEffect(() => {
    setProfileData({
      username:
        profile?.username ||
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "User",
      email: user?.email || "",
      phoneNumber: user?.user_metadata?.phone || "",
      birthday: profile?.date_of_birth || user?.user_metadata?.birthday || "",
      profilePicture:
        profile?.avatar_url || user?.user_metadata?.avatar_url || "",
    });
  }, [profile, user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      // Update the profile in Supabase
      const updates = {
        username: profileData.username,
        date_of_birth: profileData.birthday || null,
      };

      const { error } = await updateProfile(updates);

      if (error) {
        console.error("Error updating profile:", error);
        // You could show an error message to the user here
      } else {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setProfileData({
      username:
        profile?.username ||
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "User",
      email: user?.email || "",
      phoneNumber: user?.user_metadata?.phone || "",
      birthday: profile?.date_of_birth || user?.user_metadata?.birthday || "",
      profilePicture:
        profile?.avatar_url || user?.user_metadata?.avatar_url || "",
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onBack(); // Return to main page after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-medium">Profile</h1>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="relative mx-auto w-24 h-24 mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileData.profilePicture} />
                <AvatarFallback className="text-xl">
                  {getInitials(profileData.username)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                  onClick={() => {
                    // Handle profile picture upload
                    console.log("Upload profile picture");
                  }}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CardTitle className="text-2xl">{profileData.username}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Edit/Save buttons */}
            <div className="flex justify-end">
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              )}
            </div>

            {/* Profile Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({ ...profileData, username: e.target.value })
                  }
                  disabled={!isEditing}
                  className=""
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  disabled={!isEditing}
                  className=""
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      phoneNumber: e.target.value,
                    })
                  }
                  placeholder="Enter your phone number"
                  disabled={!isEditing}
                  className=""
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={profileData.birthday}
                  onChange={(e) =>
                    setProfileData({ ...profileData, birthday: e.target.value })
                  }
                  disabled={!isEditing}
                  className=""
                />
              </div>
            </div>

            {/* Account Information */}
            <div className="pt-6 border-t">
              <h3 className="font-medium mb-4">Account Information</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Account created:{" "}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "Unknown"}
                </p>
                <p>
                  Last sign in:{" "}
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : "Unknown"}
                </p>
                <p>User ID: {user?.id || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
