import { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ProfileModal } from "./profile/ProfileModal";

interface ProfileButtonProps {
  onProfileClick?: () => void;
}

export function ProfileButton({ onProfileClick }: ProfileButtonProps) {
  const { user, profile, loading } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      setProfileModalOpen(true);
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

  if (loading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 rounded-full"
        disabled
      >
        <User className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 rounded-full p-0"
        onClick={handleClick}
      >
        {profile?.avatar_url ? (
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={profile.avatar_url}
              alt={profile.display_name || "User"}
            />
            <AvatarFallback className="text-xs">
              {profile.display_name ? (
                getInitials(profile.display_name)
              ) : (
                <User className="h-3 w-3" />
              )}
            </AvatarFallback>
          </Avatar>
        ) : (
          <User className="h-4 w-4" />
        )}
      </Button>

      {profile && (
        <ProfileModal
          open={profileModalOpen}
          onOpenChange={setProfileModalOpen}
          profile={profile}
          isOwnProfile={true}
        />
      )}
    </>
  );
}
