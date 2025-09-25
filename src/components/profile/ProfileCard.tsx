import React from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MapPin, Globe, Calendar, User } from "lucide-react";
import type { Profile } from "../../types/profile";

interface ProfileCardProps {
  profile: Profile;
  showActions?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  onEdit?: () => void;
}

export function ProfileCard({
  profile,
  showActions = false,
  size = "md",
  onClick,
  onEdit,
}: ProfileCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const avatarSize = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  }[size];

  const cardClass = onClick
    ? "cursor-pointer hover:shadow-md transition-shadow"
    : "";

  return (
    <Card className={cardClass} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className={avatarSize}>
            <AvatarImage
              src={profile.avatar_url || ""}
              alt={profile.display_name || "User"}
            />
            <AvatarFallback>
              {profile.display_name ? (
                getInitials(profile.display_name)
              ) : (
                <User className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold truncate">
                  {profile.display_name || "Anonymous User"}
                </h3>
                {profile.username && (
                  <p className="text-sm text-muted-foreground">
                    @{profile.username}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    profile.profile_visibility === "public"
                      ? "default"
                      : "secondary"
                  }
                >
                  {profile.profile_visibility}
                </Badge>
                {showActions && onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.website && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Website
                  </a>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
