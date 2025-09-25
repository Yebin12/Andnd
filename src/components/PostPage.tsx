import { useState } from "react";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  X,
  Upload,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Header } from "./Header";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { postHelpers } from "../lib/supabase";
import type { PostFormData } from "../types/post";

interface PostPageProps {
  onBack: () => void;
  onSubmit: (request: any) => void;
}

const AVAILABLE_CATEGORIES = [
  "Moving",
  "Pet Care",
  "Education",
  "Yard Work",
  "Tech Support",
  "Transportation",
  "Home Repair",
  "Cleaning",
  "Delivery",
  "Shopping",
  "Childcare",
  "Elderly Care",
  "Cooking",
  "Event Help",
  "Other",
];

export function PostPage({ onBack, onSubmit }: PostPageProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [pictures, setPictures] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [emailContact, setEmailContact] = useState("");
  const [phoneContact, setPhoneContact] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [willingToPay, setWillingToPay] = useState(false);
  const [paymentType, setPaymentType] = useState<"hourly" | "total">("total");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [urgency, setUrgency] = useState<
    | "within today"
    | "within 2-3 days"
    | "within a week"
    | "no rush - whenever convenient"
  >("within a week");
  const [locationType, setLocationType] = useState<"online" | "in-person">(
    "in-person"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email.trim()) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim())
      ? ""
      : "Please enter a valid email address";
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return "";
    // Remove all non-numeric characters except the allowed dash
    const cleanPhone = phone.replace(/[^\d-]/g, "");
    // Remove dashes to check if remaining characters are numeric
    const numericOnly = cleanPhone.replace(/-/g, "");

    if (!/^\d+$/.test(numericOnly)) {
      return "Phone number should contain only numbers and dashes";
    }

    if (numericOnly.length < 10) {
      return "Please enter a valid phone number (at least 10 digits)";
    }

    return "";
  };

  const handleEmailBlur = () => {
    setEmailError(validateEmail(emailContact));
  };

  const handlePhoneBlur = () => {
    setPhoneError(validatePhone(phoneContact));
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setEmailError(validateEmail(emailContact));
      (e.target as HTMLInputElement).blur();
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setPhoneError(validatePhone(phoneContact));
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleAddCategory = (category: string) => {
    if (
      selectedCategories.length < 3 &&
      !selectedCategories.includes(category)
    ) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleRemoveCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== category));
  };

  const handleImageUpload = () => {
    // In a real app, this would open a file picker
    // For demo purposes, we'll add a placeholder image
    const placeholderImage =
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWxwJTIwcmVxdWVzdHxlbnwxfHx8fDE3NTgzOTkxMzB8MA&ixlib=rb-4.1.0&q=80&w=1080";
    if (pictures.length < 5) {
      setPictures([...pictures, placeholderImage]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setPictures(pictures.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      selectedCategories.length === 0
    ) {
      alert(
        "Please fill in all required fields (title, description, and at least one category)"
      );
      return;
    }

    if (!emailContact.trim() && !phoneContact.trim()) {
      alert("Please provide at least one contact method (email or phone)");
      return;
    }

    // Validate contact information
    const emailValidationError = validateEmail(emailContact);
    const phoneValidationError = validatePhone(phoneContact);

    if (emailContact.trim() && emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    if (phoneContact.trim() && phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Prepare post data for database
      const postData: PostFormData = {
        name: title.trim(),
        description: description.trim(),
        location:
          locationType === "online"
            ? "Online/Remote"
            : location || "Location not specified",
        is_paid: willingToPay,
        payment_type: willingToPay ? paymentType : undefined,
        payment_amount:
          willingToPay && paymentAmount ? parseFloat(paymentAmount) : undefined,
        photo_url: pictures.length > 0 ? pictures[0] : undefined, // Use first picture for now
      };

      // Save to database
      const { data: savedPost, error } = await postHelpers.createPost(postData);

      if (error) {
        console.error("Error creating post:", error);
        setSubmitError(
          error.message || "Failed to create post. Please try again."
        );
        return;
      }

      if (savedPost) {
        // Create legacy request object for backward compatibility with existing UI
        const contactMethods = [];
        if (emailContact.trim()) {
          contactMethods.push({ type: "email", value: emailContact.trim() });
        }
        if (phoneContact.trim()) {
          contactMethods.push({ type: "phone", value: phoneContact.trim() });
        }

        const newRequest = {
          id: `db-${savedPost.id}`,
          title: savedPost.name,
          description: savedPost.description,
          category: selectedCategories[0], // Primary category
          categories: selectedCategories,
          location: savedPost.location || "Location not specified",
          locationType,
          timePosted: "Just now",
          author: "You", // In real app, this would be the current user
          urgency,
          pictures: pictures.length > 0 ? pictures : undefined,
          contactMethods,
          // Legacy fields for backward compatibility
          contactType: emailContact.trim() ? "email" : "phone",
          contactInfo: emailContact.trim() || phoneContact.trim(),
          willingToPay: savedPost.is_paid,
          paymentType: willingToPay ? paymentType : undefined,
          paymentAmount:
            willingToPay && paymentAmount
              ? parseFloat(paymentAmount)
              : undefined,
        };

        onSubmit(newRequest);
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onLogoClick={onBack} isAuthenticated={true} />

      {/* Breadcrumb */}
      <div className="border-b bg-background/95">
        <div className="container mx-auto px-4 h-12 flex items-center">
          <Button variant="ghost" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl">Create a Help Request</h1>
            <p className="text-muted-foreground">
              Tell your community what help you need and connect with neighbors
              who care.
            </p>
          </div>

          {/* Title */}
          <Card className="rounded-none border-gray-200">
            <CardContent className="p-6">
              <Label htmlFor="title" className="text-lg font-medium mb-3 block">
                Request Title *
              </Label>
              <Input
                id="title"
                placeholder="What help do you need? (e.g., 'Need help moving furniture this weekend')"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="w-full rounded-lg"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {title.length}/100 characters
              </p>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="rounded-none border-gray-200">
            <CardContent className="p-6">
              <Label
                htmlFor="description"
                className="text-lg font-medium mb-3 block"
              >
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Provide more details about what you need help with, when you need it, and any other relevant information..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    (e.target as HTMLTextAreaElement).blur();
                  }
                }}
                className="w-full min-h-[120px] rounded-lg"
                maxLength={1000}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {description.length}/1000 characters
              </p>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="rounded-none border-gray-200">
            <CardContent className="p-6">
              <Label className="text-lg font-medium mb-3 block">
                Categories * (Choose up to 3)
              </Label>

              {/* Selected Categories */}
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCategories.map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="px-3 py-1 bg-black text-white border-black rounded-full flex items-center gap-2"
                    >
                      {category}
                      <button
                        onClick={() => handleRemoveCategory(category)}
                        className="hover:bg-gray-800 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Category Selector */}
              {selectedCategories.length < 3 && (
                <Select onValueChange={handleAddCategory}>
                  <SelectTrigger className="w-full rounded-lg">
                    <SelectValue placeholder="Select a category to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_CATEGORIES.filter(
                      (cat) => !selectedCategories.includes(cat)
                    ).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Pictures */}
          <Card className="rounded-none border-gray-200">
            <CardContent className="p-6">
              <Label className="text-lg font-medium mb-3 block">
                Add Pictures (Optional)
              </Label>

              {/* Uploaded Pictures */}
              {pictures.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {pictures.map((picture, index) => (
                    <div key={index} className="relative group">
                      <ImageWithFallback
                        src={picture}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {pictures.length < 5 && (
                <Button
                  variant="outline"
                  onClick={handleImageUpload}
                  className="w-full rounded-lg py-8 border-dashed border-2 hover:bg-gray-50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload pictures ({pictures.length}/5)
                    </span>
                  </div>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="rounded-none border-gray-200">
            <CardContent className="p-6">
              <Label className="text-lg font-medium mb-3 block">Location</Label>

              {/* Location Type Selection */}
              <div className="space-y-4 mb-6">
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="locationType"
                      value="in-person"
                      checked={locationType === "in-person"}
                      onChange={(e) =>
                        setLocationType(
                          e.target.value as "online" | "in-person"
                        )
                      }
                      className="text-black focus:ring-black"
                    />
                    <span className="text-sm font-medium">In-person</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="locationType"
                      value="online"
                      checked={locationType === "online"}
                      onChange={(e) =>
                        setLocationType(
                          e.target.value as "online" | "in-person"
                        )
                      }
                      className="text-black focus:ring-black"
                    />
                    <span className="text-sm font-medium">Online</span>
                  </label>
                </div>
              </div>

              {/* In-person Location Input */}
              {locationType === "in-person" && (
                <>
                  <Input
                    id="location"
                    placeholder="Search for your location (e.g., 'Downtown District', '123 Main St')"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-full rounded-lg mb-4"
                  />

                  {/* Google Maps Placeholder */}
                  <div className="w-full h-48 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Google Maps integration
                      </p>
                      <p className="text-xs text-gray-500">
                        Interactive map would appear here
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Online Location Display */}
              {locationType === "online" && (
                <div className="w-full h-32 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white text-sm">💻</span>
                    </div>
                    <p className="text-sm text-blue-700 font-medium">
                      Online/Remote Help
                    </p>
                    <p className="text-xs text-blue-600">
                      This help will be provided remotely
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="rounded-none border-gray-200">
            <CardContent className="p-6">
              <Label className="text-lg font-medium mb-3 block">
                Contact Information
              </Label>

              <p className="text-sm text-muted-foreground mb-4">
                Provide at least one way for helpers to contact you
              </p>

              {/* Email Input */}
              <div className="space-y-2 mb-4">
                <Label
                  htmlFor="email"
                  className="text-base font-medium flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  placeholder="your.email@example.com"
                  value={emailContact}
                  onChange={(e) => {
                    setEmailContact(e.target.value);
                    // Clear error when user starts typing
                    if (emailError) setEmailError("");
                  }}
                  onBlur={handleEmailBlur}
                  onKeyDown={handleEmailKeyDown}
                  className={`w-full rounded-lg ${
                    emailError ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  type="email"
                />
                {emailError && (
                  <p className="text-sm text-red-500 mt-1">{emailError}</p>
                )}
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-base font-medium flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="(555) 123-4567"
                  value={phoneContact}
                  onChange={(e) => {
                    setPhoneContact(e.target.value);
                    // Clear error when user starts typing
                    if (phoneError) setPhoneError("");
                  }}
                  onBlur={handlePhoneBlur}
                  onKeyDown={handlePhoneKeyDown}
                  className={`w-full rounded-lg ${
                    phoneError ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  type="tel"
                />
                {phoneError && (
                  <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                )}
              </div>

              {/* Helper text */}
              <p className="text-xs text-muted-foreground mt-3">
                You can provide both email and phone, or just one of them
              </p>
            </CardContent>
          </Card>

          {/* Payment & Urgency */}
          <Card className="rounded-none border-gray-200">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Payment Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <div>
                      <Label className="text-lg font-medium">
                        Willing to Pay
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Are you offering compensation for this help?
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={willingToPay}
                    onCheckedChange={setWillingToPay}
                  />
                </div>

                {/* Payment Details - Show when willing to pay */}
                {willingToPay && (
                  <div className="ml-8 space-y-4">
                    {/* Payment Type Selection */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">
                        Payment Type
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          variant={
                            paymentType === "total" ? "default" : "outline"
                          }
                          onClick={() => setPaymentType("total")}
                          className="rounded-full flex items-center gap-2 flex-1"
                        >
                          <DollarSign className="w-4 h-4" />
                          Total Payment
                        </Button>
                        <Button
                          variant={
                            paymentType === "hourly" ? "default" : "outline"
                          }
                          onClick={() => setPaymentType("hourly")}
                          className="rounded-full flex items-center gap-2 flex-1"
                        >
                          <DollarSign className="w-4 h-4" />
                          Hourly Rate
                        </Button>
                      </div>
                    </div>

                    {/* Payment Amount */}
                    <div>
                      <Label
                        htmlFor="paymentAmount"
                        className="text-base font-medium"
                      >
                        {paymentType === "hourly"
                          ? "Hourly Rate"
                          : "Total Amount"}
                      </Label>
                      <div className="relative mt-2">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="paymentAmount"
                          placeholder={
                            paymentType === "hourly" ? "25.00" : "100.00"
                          }
                          className="pl-10 rounded-lg"
                          type="number"
                          min="0"
                          step="0.01"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {paymentType === "hourly"
                          ? "Specify how much you're willing to pay per hour"
                          : "Specify the total amount you're willing to pay for this help"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Urgency */}
                <div>
                  <Label className="text-lg font-medium mb-3 block">
                    Need it by
                  </Label>
                  <Select
                    value={urgency}
                    onValueChange={(value: any) => setUrgency(value)}
                  >
                    <SelectTrigger className="w-full rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="within today">within today</SelectItem>
                      <SelectItem value="within 2-3 days">
                        within 2-3 days
                      </SelectItem>
                      <SelectItem value="within a week">
                        within a week
                      </SelectItem>
                      <SelectItem value="no rush - whenever convenient">
                        no rush - whenever convenient
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {submitError}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 rounded-full py-3"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-black hover:bg-gray-800 text-white rounded-full py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Post..." : "Post Request"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
