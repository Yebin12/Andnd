import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gknokhovhtsttxtjwqzw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrbm9raG92aHRzdHR4dGp3cXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjYxMDAsImV4cCI6MjA3NDAwMjEwMH0.fNdNVyatvTH2CI6bzGxmx931alksfFtMaqgaarJnYho'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'helperhub-web-app'
    }
  }
})

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
          emailRedirectTo: `${window.location.origin}`
        }
      })
      return { data, error }
    } catch (error) {
      console.error('SignUp error:', error)
      return { data: null, error: { message: 'Network error occurred. Please check your connection and try again.' } }
    }
  },

  // Sign up with phone and password
  async signUpWithPhone(phone: string, password: string, metadata: any = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: metadata
        }
      })
      return { data, error }
    } catch (error) {
      console.error('SignUpWithPhone error:', error)
      return { data: null, error: { message: 'Network error occurred. Please check your connection and try again.' } }
    }
  },

  // Sign in with email and password
  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } catch (error) {
      console.error('SignInWithEmail error:', error)
      return { data: null, error: { message: 'Network error occurred. Please check your connection and try again.' } }
    }
  },

  // Sign in with phone and password
  async signInWithPhone(phone: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone,
        password
      })
      return { data, error }
    } catch (error) {
      console.error('SignInWithPhone error:', error)
      return { data: null, error: { message: 'Network error occurred. Please check your connection and try again.' } }
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
        message: "Please use your email or phone number to log in. Username login requires additional setup." 
      } 
    }
  },

  // Send password reset email
  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      return { data, error }
    } catch (error) {
      console.error('ResetPassword error:', error)
      return { data: null, error: { message: 'Network error occurred. Please check your connection and try again.' } }
    }
  },

  // Send password reset SMS
  async resetPasswordSMS(phone: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForPhone(phone)
      return { data, error }
    } catch (error) {
      console.error('ResetPasswordSMS error:', error)
      return { data: null, error: { message: 'Network error occurred. Please check your connection and try again.' } }
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('SignOut error:', error)
      return { error: { message: 'Network error occurred during sign out.' } }
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      return { session, error }
    } catch (error) {
      console.error('GetSession error:', error)
      return { session: null, error: { message: 'Network error occurred while getting session.' } }
    }
  },

  // Get current user
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } catch (error) {
      console.error('GetUser error:', error)
      return { user: null, error: { message: 'Network error occurred while getting user.' } }
    }
  },

  // Update user metadata
  async updateUserMetadata(metadata: any) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      })
      return { data, error }
    } catch (error) {
      console.error('UpdateUserMetadata error:', error)
      return { data: null, error: { message: 'Network error occurred while updating user.' } }
    }
  },

  // Verify OTP for phone sign up
  async verifyOTP(phone: string, token: string, type: 'sms' | 'phone_change' = 'sms') {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type
      })
      return { data, error }
    } catch (error) {
      console.error('VerifyOTP error:', error)
      return { data: null, error: { message: 'Network error occurred while verifying OTP.' } }
    }
  },

  // Verify OTP for email sign up
  async verifyEmailOTP(email: string, token: string, type: 'signup' | 'email_change' = 'signup') {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type
      })
      return { data, error }
    } catch (error) {
      console.error('VerifyEmailOTP error:', error)
      return { data: null, error: { message: 'Network error occurred while verifying OTP.' } }
    }
  }
}

// Auth state change listener with error handling
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  try {
    return supabase.auth.onAuthStateChange((event, session) => {
      try {
        callback(event, session)
      } catch (error) {
        console.error('Error in auth state change callback:', error)
      }
    })
  } catch (error) {
    console.error('Error setting up auth state change listener:', error)
    // Return a dummy subscription that can be safely unsubscribed
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    }
  }
}

// Utility functions
export const utils = {
  // Check if string is email
  isEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(str)
  },

  // Check if string is phone number
  isPhone(str: string): boolean {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(str.replace(/\s/g, ''))
  },

  // Format phone number for Supabase (E.164 format)
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `+1${cleaned}` // Assume US number if 10 digits
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`
    }
    return `+${cleaned}` // Assume international format
  },

  // Determine login method based on input
  getLoginMethod(identifier: string): 'email' | 'phone' | 'username' {
    if (this.isEmail(identifier)) return 'email'
    if (this.isPhone(identifier)) return 'phone'
    return 'username'
  }
}