// Profile-related TypeScript types

export interface Profile {
  id: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  date_of_birth?: string;
  phone_verified: boolean;
  email_verified: boolean;
  profile_visibility: "public" | "friends" | "private";
  show_email: boolean;
  show_phone: boolean;
  created_at: string;
  updated_at: string;
  last_seen: string;
}

export interface UserPreferences {
  user_id: string;
  theme: "light" | "dark" | "system";
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

export interface ProfileWithPreferences extends Profile {
  user_preferences?: UserPreferences;
}

// Form data types
export interface ProfileFormData {
  username?: string;
  display_name?: string;
  bio?: string;
  location?: string;
  website?: string;
  date_of_birth?: string;
  profile_visibility: "public" | "friends" | "private";
  show_email: boolean;
  show_phone: boolean;
}

export interface PreferencesFormData {
  theme: "light" | "dark" | "system";
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

// API response types
export interface ProfileResponse {
  data: Profile | null;
  error: any;
}

export interface ProfilesResponse {
  data: Profile[] | null;
  error: any;
}

export interface UsernameAvailabilityResponse {
  available: boolean;
  error: any;
}
