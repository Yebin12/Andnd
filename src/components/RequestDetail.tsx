import { ArrowLeft, Clock, MapPin, User, Phone, Mail, MessageCircle, Camera } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Request } from "./RequestCard";
import { Header } from "./Header";
import { PictureGallery } from "./PictureGallery";

interface RequestDetailProps {
  request: Request;
  onBack: () => void;
}

export function RequestDetail({ request, onBack }: RequestDetailProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header onLogoClick={onBack} />
      
      {/* Breadcrumb */}
      <div className="border-b bg-background/95">
        <div className="container mx-auto px-4 h-12 flex items-center">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Requests
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Header */}
            <Card className="rounded-none border-gray-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Category and Urgency */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs px-3 py-1 bg-gray-50 text-gray-600 border-transparent rounded-none">
                      {request.category}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
                    {request.title}
                  </h2>

                  {/* Meta Information */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>Posted by {request.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{request.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{request.timePosted}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="rounded-none border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {request.description}
                </p>
              </CardContent>
            </Card>

            {/* Pictures */}
            {request.pictures && request.pictures.length > 0 && (
              <Card className="rounded-none border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Camera className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-medium">
                      Pictures ({request.pictures.length})
                    </h3>
                  </div>
                  <PictureGallery pictures={request.pictures} title={request.title} />
                </CardContent>
              </Card>
            )}

            {/* Additional Details */}
            <Card className="rounded-none border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Request Type:</span>
                    <span className="font-medium text-gray-900">{request.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium text-gray-900">{request.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Posted:</span>
                    <span className="font-medium text-gray-900">{request.timePosted}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Map */}
            {request.locationType !== "online" && (
              <Card className="rounded-none border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Location</h3>
                  <div className="w-full h-64 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">{request.location}</p>
                      <p className="text-xs text-gray-500 mt-1">Interactive map would appear here</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {request.location}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Online Help Information */}
            {request.locationType === "online" && (
              <Card className="rounded-none border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Online/Remote Help</h3>
                  <div className="w-full h-64 rounded-lg overflow-hidden border bg-blue-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white text-lg">💻</span>
                      </div>
                      <p className="text-sm text-blue-700 font-medium">This help will be provided remotely</p>
                      <p className="text-xs text-blue-600 mt-1">Connect via video call, phone, or messaging</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    💻 Online assistance - no physical location required
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="rounded-none border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Offer Your Help</h3>
                <div className="space-y-3">
                  <Button className="w-full bg-black hover:bg-gray-800 text-white rounded-full py-3">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full rounded-full py-3">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Helper
                  </Button>
                  <Button variant="outline" className="w-full rounded-full py-3">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Response */}
            <Card className="rounded-none border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Quick Response</h3>
                <div className="space-y-3">
                  <Textarea 
                    placeholder="Let them know how you can help..."
                    className="min-h-[100px] rounded-lg"
                  />
                  <Button className="w-full bg-black hover:bg-gray-800 text-white rounded-full py-2.5">
                    Send Response
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Helper Guidelines */}
            <Card className="rounded-none border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Helper Guidelines</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Be respectful and professional</p>
                  <p>• Confirm details before meeting</p>
                  <p>• Meet in public places when possible</p>
                  <p>• Trust your instincts</p>
                  <p>• Report any issues to HelperHub</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}