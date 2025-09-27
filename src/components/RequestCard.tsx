import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Clock, MapPin, User, Bookmark } from "lucide-react";

// Enhanced location data from Google Maps
export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  categories?: string[];
  location: string;
  locationType?: "online" | "in-person";
  // Enhanced location data from Google Maps
  location_lat?: number; // Latitude coordinate
  location_lng?: number; // Longitude coordinate
  location_radius?: number; // Search radius in miles
  location_privacy?: "exact" | "approximate" | "hidden"; // Location privacy level
  show_exact_location?: boolean; // Whether to show exact coordinates
  selectedLocation?: LocationData | null; // Full location data from Google Maps
  timePosted: string;
  author: string;
  urgency:
    | "within today"
    | "within 2-3 days"
    | "within a week"
    | "no rush - whenever convenient";
  pictures?: string[];
  contactType?: "phone" | "email";
  contactInfo?: string;
  willingToPay?: boolean;
  resolved?: boolean;
}

interface RequestCardProps {
  request: Request;
  onSelect?: (request: Request) => void;
  isSaved?: boolean;
  onSave?: (requestId: string) => void;
  onUnsave?: (requestId: string) => void;
}

export function RequestCard({
  request,
  onSelect,
  isSaved = false,
  onSave,
  onUnsave,
}: RequestCardProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "within today":
        return "bg-red-100 text-red-800";
      case "within 2-3 days":
        return "bg-orange-100 text-orange-800";
      case "within a week":
        return "bg-green-100 text-green-800";
      case "no rush - whenever convenient":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="relative overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-gray-300 rounded-none">
      <CardContent
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onSelect?.(request)}
      >
        <div className="space-y-4">
          {/* Header with category and bookmark */}
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="text-xs px-2 py-1 bg-gray-50 text-gray-600 border-transparent rounded-none"
            >
              {request.category}
            </Badge>
            {(onSave || onUnsave) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSaved && onUnsave) {
                    onUnsave(request.id);
                  } else if (!isSaved && onSave) {
                    onSave(request.id);
                  }
                }}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <Bookmark
                  className={`h-4 w-4 ${
                    isSaved ? "fill-current text-blue-600" : "text-gray-400"
                  }`}
                />
              </Button>
            )}
          </div>

          {/* Title */}
          <div className="h-[3rem]">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-2">
              {request.title}
            </h3>
          </div>

          {/* Description */}
          <div className="h-[4.5rem]">
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {request.description}
            </p>
          </div>

          {/* Meta information */}
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3" />
              <span>{request.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              <span>{request.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{request.timePosted}</span>
            </div>
          </div>

          {/* Action button */}
          <Button
            className="w-full mt-4 bg-black hover:bg-gray-800 text-white rounded-full py-2.5"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(request);
            }}
          >
            Offer Help
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
