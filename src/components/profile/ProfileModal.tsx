import React, { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import {
  MapPin,
  Globe,
  Calendar,
  User,
  Edit,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { EditProfileModal } from "./EditProfileModal";
import type { Profile } from "../../types/profile";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  isOwnProfile?: boolean;
}

export function ProfileModal({
  open,
  onOpenChange,
  profile,
  isOwnProfile = false,
}: ProfileModalProps) {
  const { user } = useAuth();
  const [editModalOpen, setEditModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    // The profile will be updated through the AuthContext
    // This callback could be used for additional UI updates if needed
  };

  const canViewContactInfo =
    isOwnProfile || profile.profile_visibility === "public";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Header with Avatar and Basic Info */}
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={profile.avatar_url || ""}
                  alt={profile.display_name || "User"}
                />
                <AvatarFallback className="text-lg">
                  {profile.display_name ? (
                    getInitials(profile.display_name)
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {profile.display_name || "Anonymous User"}
                    </h2>
                    {profile.username && (
                      <p className="text-muted-foreground">
                        @{profile.username}
                      </p>
                    )}
                  </div>

                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditModalOpen(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <Badge
                    variant={
                      profile.profile_visibility === "public"
                        ? "default"
                        : "secondary"
                    }
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {profile.profile_visibility}
                  </Badge>
                  {profile.phone_verified && (
                    <Badge variant="outline">
                      <Phone className="h-3 w-3 mr-1" />
                      Phone Verified
                    </Badge>
                  )}
                  {profile.email_verified && (
                    <Badge variant="outline">
                      <Mail className="h-3 w-3 mr-1" />
                      Email Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            <Separator />

            {/* Details */}
            <div className="space-y-3">
              <h3 className="font-semibold">Details</h3>

              <div className="grid grid-cols-1 gap-3 text-sm">
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {formatDate(profile.created_at)}</span>
                </div>

                {profile.date_of_birth && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Born {formatDate(profile.date_of_birth)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information (if allowed) */}
            {canViewContactInfo &&
              (profile.show_email || profile.show_phone) &&
              user && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold">Contact Information</h3>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      {profile.show_email && user.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                      )}

                      {profile.show_phone && user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

            {/* Activity */}
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold">Activity</h3>
              <div className="text-sm text-muted-foreground">
                <p>Last seen {formatDate(profile.last_seen)}</p>
                <p>Profile updated {formatDate(profile.updated_at)}</p>
              </div>
            </div>

            {/* Actions */}
            {!isOwnProfile && (
              <>
                <Separator />
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          currentProfile={profile}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </>
  );
}
