import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Clock, MapPin, User } from "lucide-react";

export interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  categories?: string[];
  location: string;
  locationType?: "online" | "in-person";
  timePosted: string;
  author: string;
  urgency: "within today" | "within 2-3 days" | "within a week" | "no rush - whenever convenient";
  pictures?: string[];
  contactType?: "phone" | "email";
  contactInfo?: string;
  willingToPay?: boolean;
}

interface RequestCardProps {
  request: Request;
  onSelect?: (request: Request) => void;
}

export function RequestCard({ request, onSelect }: RequestCardProps) {
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
          {/* Header with category and urgency */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-50 text-gray-600 border-transparent rounded-none">
              {request.category}
            </Badge>
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