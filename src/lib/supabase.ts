import { createClient } from "@supabase/supabase-js";
import type {
  Profile,
  UserPreferences,
  ProfileResponse,
  ProfilesResponse,
  UsernameAvailabilityResponse,
} from "../types/profile";
import type {
  Post,
  PostWithProfile,
  PostFormData,
  PostResponse,
  PostsResponse,
  PostsWithProfileResponse,
} from "../types/post";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  global: {
    headers: {
      "X-Client-Info": "helperhub-web-app",
    },
  },
});

// Helper functions for authentication
export const authHelpers = {
  // Sign up with email and password
  async signUp(email: string, password: string, metadata: any = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}`,
        },
      });
      return { data, error };
    } catch (error) {
      console.error("SignUp error:", error);
      return {
        data: null,
        error: {
          message:
            "Network error occurred. Please check your connection and try again.",
        },
      };
    }
  },

  // Sign up with phone and password
  async signUpWithPhone(phone: string, password: string, metadata: any = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: metadata,
        },
      });
      return { data, error };
    } catch (error) {
      console.error("SignUpWithPhone error:", error);
      return {
        data: null,
        error: {
          message:
            "Network error occurred. Please check your connection and try again.",
        },
      };
    }
  },

  // Sign in with email and password
  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error("SignInWithEmail error:", error);
      return {
        data: null,
        error: {
          message:
            "Network error occurred. Please check your connection and try again.",
        },
      };
    }
  },

  // Sign in with phone and password
  async signInWithPhone(phone: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error("SignInWithPhone error:", error);
      return {
        data: null,
        error: {
          message:
            "Network error occurred. Please check your connection and try again.",
        },
      };
    }
  },

  // Sign in with username (stored in user metadata)
  async signInWithUsername(username: string, password: string) {
    // First, we need to find the user by username
    // This requires a custom function or table lookup
    // For now, we'll return an error suggesting email/phone login
    return {
      data: null,
      error: {
        message:
          "Please use your email or phone number to log in. Username login requires additional setup.",
      },
    };
  },

  // Send password reset email
  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { data, error };
    } catch (error) {
      console.error("ResetPassword error:", error);
      return {
        data: null,
        error: {
          message:
            "Network error occurred. Please check your connection and try again.",
        },
      };
    }
  },

  // Send password reset SMS
  async resetPasswordSMS(phone: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: { channel: "sms", shouldCreateUser: false },
      });
      return { data, error };
    } catch (error) {
      console.error("ResetPasswordSMS error:", error);
      return {
        data: null,
        error: {
          message:
            "Network error occurred. Please check your connection and try again.",
        },
      };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error("SignOut error:", error);
      return { error: { message: "Network error occurred during sign out." } };
    }
  },

  // Get current session
  async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      return { session, error };
    } catch (error) {
      console.error("GetSession error:", error);
      return {
        session: null,
        error: { message: "Network error occurred while getting session." },
      };
    }
  },

  // Get current user
  async getUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      console.error("GetUser error:", error);
      return {
        user: null,
        error: { message: "Network error occurred while getting user." },
      };
    }
  },

  // Update user metadata
  async updateUserMetadata(metadata: any) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata,
      });
      return { data, error };
    } catch (error) {
      console.error("UpdateUserMetadata error:", error);
      return {
        data: null,
        error: { message: "Network error occurred while updating user." },
      };
    }
  },

  // Verify OTP for phone sign up
  async verifyOTP(
    phone: string,
    token: string,
    type: "sms" | "phone_change" = "sms"
  ) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type,
      });
      return { data, error };
    } catch (error) {
      console.error("VerifyOTP error:", error);
      return {
        data: null,
        error: { message: "Network error occurred while verifying OTP." },
      };
    }
  },

  // Verify OTP for email sign up
  async verifyEmailOTP(
    email: string,
    token: string,
    type: "signup" | "email_change" = "signup"
  ) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });
      return { data, error };
    } catch (error) {
      console.error("VerifyEmailOTP error:", error);
      return {
        data: null,
        error: { message: "Network error occurred while verifying OTP." },
      };
    }
  },
};

// Auth state change listener with error handling
export const onAuthStateChange = (
  callback: (event: string, session: any) => void
) => {
  try {
    return supabase.auth.onAuthStateChange((event, session) => {
      try {
        callback(event, session);
      } catch (error) {
        console.error("Error in auth state change callback:", error);
      }
    });
  } catch (error) {
    console.error("Error setting up auth state change listener:", error);
    // Return a dummy subscription that can be safely unsubscribed
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  }
};

// Utility functions
export const utils = {
  // Check if string is email
  isEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  },

  // Check if string is phone number
  isPhone(str: string): boolean {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(str.replace(/\s/g, ""));
  },

  // Format phone number for Supabase (E.164 format)
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `+1${cleaned}`; // Assume US number if 10 digits
    }
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+${cleaned}`;
    }
    return `+${cleaned}`; // Assume international format
  },

  // Determine login method based on input
  getLoginMethod(identifier: string): "email" | "phone" | "username" {
    if (this.isEmail(identifier)) return "email";
    if (this.isPhone(identifier)) return "phone";
    return "username";
  },
};

// Profile-related helper functions
export const profileHelpers = {
  // Get user profile
  async getProfile(userId: string): Promise<ProfileResponse> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          user_preferences (*)
        `
        )
        .eq("id", userId)
        .single();
      return { data, error };
    } catch (error) {
      console.error("GetProfile error:", error);
      return { data: null, error: { message: "Failed to fetch profile" } };
    }
  },

  // Update user profile
  async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<ProfileResponse> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error("UpdateProfile error:", error);
      return { data: null, error: { message: "Failed to update profile" } };
    }
  },

  // Check username availability
  async checkUsernameAvailability(
    username: string,
    excludeUserId?: string
  ): Promise<UsernameAvailabilityResponse> {
    try {
      let query = supabase
        .from("profiles")
        .select("id")
        .eq("username", username);

      if (excludeUserId) {
        query = query.neq("id", excludeUserId);
      }

      const { data, error } = await query;
      return {
        available: !data || data.length === 0,
        error,
      };
    } catch (error) {
      console.error("CheckUsername error:", error);
      return {
        available: false,
        error: { message: "Failed to check username" },
      };
    }
  },

  // Upload avatar
  async uploadAvatar(userId: string, file: File): Promise<ProfileResponse> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId)
        .select()
        .single();

      return { data: profileData, error: profileError };
    } catch (error) {
      console.error("UploadAvatar error:", error);
      return { data: null, error: { message: "Failed to upload avatar" } };
    }
  },

  // Search profiles
  async searchProfiles(
    query: string,
    limit: number = 20
  ): Promise<{ data: Partial<Profile>[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio")
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .eq("profile_visibility", "public")
        .limit(limit);
      return { data, error };
    } catch (error) {
      console.error("SearchProfiles error:", error);
      return { data: null, error: { message: "Failed to search profiles" } };
    }
  },

  // Update user preferences
  async updatePreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<{ data: UserPreferences | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          ...preferences,
        })
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error("UpdatePreferences error:", error);
      return { data: null, error: { message: "Failed to update preferences" } };
    }
  },

  // Get user preferences
  async getPreferences(
    userId: string
  ): Promise<{ data: UserPreferences | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();
      return { data, error };
    } catch (error) {
      console.error("GetPreferences error:", error);
      return { data: null, error: { message: "Failed to fetch preferences" } };
    }
  },
};

// Post-related helper functions
export const postHelpers = {
  // Create a new post
  async createPost(postData: PostFormData): Promise<PostResponse> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return { data: null, error: { message: "User not authenticated" } };
      }

      const { data, error } = await supabase
        .from("posts")
        .insert({
          ...postData,
          user_id: user.id,
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error("CreatePost error:", error);
      return { data: null, error: { message: "Failed to create post" } };
    }
  },

  // Get all posts with user profiles
  async getAllPosts(limit: number = 50): Promise<PostsWithProfileResponse> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      return { data, error };
    } catch (error) {
      console.error("GetAllPosts error:", error);
      return { data: null, error: { message: "Failed to fetch posts" } };
    }
  },

  // Get posts by user
  async getUserPosts(userId: string): Promise<PostsResponse> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      return { data, error };
    } catch (error) {
      console.error("GetUserPosts error:", error);
      return { data: null, error: { message: "Failed to fetch user posts" } };
    }
  },

  // Get a single post by ID
  async getPost(postId: string): Promise<PostResponse> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `
        )
        .eq("id", postId)
        .single();

      return { data, error };
    } catch (error) {
      console.error("GetPost error:", error);
      return { data: null, error: { message: "Failed to fetch post" } };
    }
  },

  // Update a post
  async updatePost(
    postId: string,
    updates: Partial<PostFormData>
  ): Promise<PostResponse> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error("UpdatePost error:", error);
      return { data: null, error: { message: "Failed to update post" } };
    }
  },

  // Delete a post
  async deletePost(postId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      return { error };
    } catch (error) {
      console.error("DeletePost error:", error);
      return { error: { message: "Failed to delete post" } };
    }
  },

  // Search posts by location or name
  async searchPosts(
    query: string,
    limit: number = 20
  ): Promise<PostsWithProfileResponse> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `
        )
        .or(
          `name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      return { data, error };
    } catch (error) {
      console.error("SearchPosts error:", error);
      return { data: null, error: { message: "Failed to search posts" } };
    }
  },

  // Filter posts by paid/unpaid status
  async getPostsByPaymentStatus(
    isPaid: boolean,
    limit: number = 50
  ): Promise<PostsWithProfileResponse> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `
        )
        .eq("is_paid", isPaid)
        .order("created_at", { ascending: false })
        .limit(limit);

      return { data, error };
    } catch (error) {
      console.error("GetPostsByPaymentStatus error:", error);
      return {
        data: null,
        error: { message: "Failed to fetch posts by payment status" },
      };
    }
  },
};
