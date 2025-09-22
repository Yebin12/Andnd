import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { authHelpers, utils } from "../lib/supabase";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticationComplete?: () => void;
  onSwitchToSignUp?: () => void; // New prop to handle switching to sign up
}

export function LoginModal({ 
  open, 
  onOpenChange, 
  onAuthenticationComplete = () => {},
  onSwitchToSignUp = () => {}
}: LoginModalProps) {
  const [formData, setFormData] = useState({
    identifier: "", // Can be phone, email, or username
    password: ""
  });
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Refs for focusing inputs
  const identifierInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset errors when user starts typing
    setShowError(false);
    setErrorMessage("");
  };

  const isFormComplete = () => {
    return formData.identifier.trim() && formData.password.trim();
  };

  // Handle Enter key navigation
  const handleIdentifierKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordInputRef.current?.focus();
    }
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isFormComplete()) {
        handleSubmit(e as any);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete()) {
      setShowError(true);
      setErrorMessage("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    setShowError(false);
    setErrorMessage("");

    try {
      const { identifier, password } = formData;
      const loginMethod = utils.getLoginMethod(identifier);
      
      let result;
      
      if (loginMethod === 'email') {
        result = await authHelpers.signInWithEmail(identifier, password);
      } else if (loginMethod === 'phone') {
        const formattedPhone = utils.formatPhone(identifier);
        result = await authHelpers.signInWithPhone(formattedPhone, password);
      } else {
        // Username login - for now we'll show an error
        result = await authHelpers.signInWithUsername(identifier, password);
      }

      if (result.error) {
        setShowError(true);
        setErrorMessage(result.error.message || "Login failed. Please check your credentials.");
      } else if (result.data?.user) {
        console.log("Login successful:", result.data.user);
        onAuthenticationComplete();
        onOpenChange(false);
        
        // Reset form
        setFormData({
          identifier: "",
          password: ""
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setShowError(true);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.identifier.trim()) {
      setShowError(true);
      setErrorMessage("Please enter your email or phone number first");
      return;
    }

    setResetLoading(true);
    setShowError(false);
    setErrorMessage("");

    try {
      const { identifier } = formData;
      const method = utils.getLoginMethod(identifier);
      
      let result;
      
      if (method === 'email') {
        result = await authHelpers.resetPassword(identifier);
      } else if (method === 'phone') {
        const formattedPhone = utils.formatPhone(identifier);
        result = await authHelpers.resetPasswordSMS(formattedPhone);
      } else {
        setShowError(true);
        setErrorMessage("Please enter your email or phone number to reset your password");
        setResetLoading(false);
        return;
      }

      if (result.error) {
        setShowError(true);
        setErrorMessage(result.error.message || "Failed to send reset link. Please try again.");
      } else {
        console.log("Password reset sent to:", identifier);
        setShowForgotPassword(false);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setShowError(true);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      // Reset form when modal closes
      setFormData({
        identifier: "",
        password: ""
      });
      setShowError(false);
      setErrorMessage("");
      setShowForgotPassword(false);
      setLoading(false);
      setResetLoading(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border-0 p-8 bg-white">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {showForgotPassword ? "Reset your password" : "Log in to your account"}
          </DialogTitle>
        </div>
        
        <DialogDescription className="sr-only">
          {showForgotPassword 
            ? "Enter your email, phone, or username to reset your password" 
            : "Enter your credentials to log in to your HelperHub account"
          }
        </DialogDescription>
        
        {showForgotPassword ? (
          /* Forgot Password View */
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-6">
                Enter your email, phone number, or username and we'll send you a link to reset your password.
              </p>
            </div>
            
            <div>
              <Input
                ref={identifierInputRef}
                type="text"
                placeholder="Email, phone, or username"
                value={formData.identifier}
                onChange={(e) => handleInputChange("identifier", e.target.value)}
                className="h-14 rounded-lg text-base placeholder:text-gray-500 focus:ring-0 border-gray-200 focus:border-gray-300"
                required
              />
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={handleForgotPassword}
                disabled={!formData.identifier.trim() || resetLoading}
                className={`w-full h-14 text-white rounded-full text-base font-medium transition-all ${
                  formData.identifier.trim() && !resetLoading
                    ? 'bg-gray-700 hover:bg-gray-800' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {resetLoading ? "Sending..." : "Send reset link"}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForgotPassword(false)}
                disabled={resetLoading}
                className="w-full h-14 text-gray-600 rounded-full text-base font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Back to login
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Identifier Field (Phone/Email/Username) */}
              <div>
                <Input
                  ref={identifierInputRef}
                  type="text"
                  placeholder="Email, phone, or username"
                  value={formData.identifier}
                  onChange={(e) => handleInputChange("identifier", e.target.value)}
                  onKeyDown={handleIdentifierKeyDown}
                  className={`h-14 rounded-lg text-base placeholder:text-gray-500 focus:ring-0 ${
                    showError && !formData.identifier.trim()
                      ? 'border-red-300 focus:border-red-400' 
                      : 'border-gray-200 focus:border-gray-300'
                  }`}
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <Input
                  ref={passwordInputRef}
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  onKeyDown={handlePasswordKeyDown}
                  className={`h-14 rounded-lg text-base placeholder:text-gray-500 focus:ring-0 ${
                    showError && !formData.password.trim()
                      ? 'border-red-300 focus:border-red-400' 
                      : 'border-gray-200 focus:border-gray-300'
                  }`}
                  required
                />
              </div>

              {/* Error Message */}
              {showError && errorMessage && (
                <div className="text-center">
                  <p className="text-xs text-red-500">{errorMessage}</p>
                </div>
              )}

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  disabled={loading}
                  className="text-blue-500 text-sm font-normal hover:underline disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={!isFormComplete() || loading}
                  className={`w-full h-14 text-white rounded-full text-base font-medium transition-all ${
                    isFormComplete() && !loading
                      ? 'bg-gray-700 hover:bg-gray-800' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {loading ? "Logging in..." : "Log In"}
                </Button>
              </div>
            </form>

            {/* Don't have an account? Sign up */}
            <div className="text-center pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="text-blue-500 hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}