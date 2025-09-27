// Post-related TypeScript types

// Enhanced location data from Google Maps
export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export interface Post {
  id: string;
  name: string;
  description: string;
  photo_url?: string;
  location?: string; // Human-readable address
  location_lat?: number; // Latitude coordinate
  location_lng?: number; // Longitude coordinate
  location_type?: "online" | "in-person"; // Type of location
  location_radius?: number; // Search radius in miles
  location_privacy?: "exact" | "approximate" | "hidden"; // Location privacy level
  show_exact_location?: boolean; // Whether to show exact coordinates
  is_paid: boolean;
  payment_type?: "hourly" | "total";
  payment_amount?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PostWithProfile extends Post {
  profiles?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

// Form data types for creating posts
export interface PostFormData {
  name: string;
  description: string;
  photo_url?: string;
  location?: string; // Human-readable address
  location_lat?: number; // Latitude coordinate
  location_lng?: number; // Longitude coordinate
  location_type?: "online" | "in-person"; // Type of location
  location_radius?: number; // Search radius in miles
  location_privacy?: "exact" | "approximate" | "hidden"; // Location privacy level
  show_exact_location?: boolean; // Whether to show exact coordinates
  is_paid: boolean;
  payment_type?: "hourly" | "total";
  payment_amount?: number;
}

// Legacy Request type mapping (for backward compatibility)
export interface Request {
  id: string;
  title: string;
  description: string;
  category?: string;
  categories?: string[];
  location: string;
  locationType?: "online" | "in-person";
  timePosted: string;
  author: string;
  urgency?:
    | "within today"
    | "within 2-3 days"
    | "within a week"
    | "no rush - whenever convenient";
  pictures?: string[];
  contactMethods?: Array<{ type: "email" | "phone"; value: string }>;
  contactType?: "email" | "phone";
  contactInfo?: string;
  willingToPay?: boolean;
  paymentType?: "hourly" | "total";
  paymentAmount?: number;
}

// API response types
export interface PostResponse {
  data: Post | null;
  error: any;
}

export interface PostsResponse {
  data: Post[] | null;
  error: any;
}

export interface PostsWithProfileResponse {
  data: PostWithProfile[] | null;
  error: any;
}
