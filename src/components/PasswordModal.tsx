import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { authHelpers, utils } from "../lib/supabase";

interface PasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onSignUpComplete: () => void;
  onSwitchToLogin?: () => void; // New prop for switching to login
  formData?: {
    name: string;
    email: string;
    phone: string;
    username: string;
    month: string;
    day: string;
    year: string;
  };
}

export function PasswordModal({
  open,
  onOpenChange,
  onBack,
  onSignUpComplete,
  onSwitchToLogin = () => {},
  formData,
}: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userAlreadyExists, setUserAlreadyExists] = useState(false);

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?\":{}|<>]/.test(password);

  const isPasswordValid =
    hasMinLength && hasLetter && hasNumber && hasSpecialChar;
  const canSignUp =
    isPasswordValid && acceptedTerms && !loading && !userAlreadyExists;

  const handleSignUp = async () => {
    if (!canSignUp || !formData) return;

    setLoading(true);
    setError("");
    setUserAlreadyExists(false);

    try {
      // Prepare user metadata
      const userMetadata = {
        name: formData.name,
        username: formData.username,
        date_of_birth: `${formData.year}-${formData.month.padStart(
          2,
          "0"
        )}-${formData.day.padStart(2, "0")}`,
        created_at: new Date().toISOString(),
      };

      let result;

      // Determine if we're using email or phone
      if (formData.email) {
        result = await authHelpers.signUp(
          formData.email,
          password,
          userMetadata
        );
      } else if (formData.phone) {
        const formattedPhone = utils.formatPhone(formData.phone);
        result = await authHelpers.signUpWithPhone(
          formattedPhone,
          password,
          userMetadata
        );
      } else {
        throw new Error("No email or phone provided");
      }

      if (result.error) {
        // Check if the error is due to user already existing
        const errorMessage = result.error.message?.toLowerCase() || "";
        if (
          errorMessage.includes("already") ||
          errorMessage.includes("exists") ||
          errorMessage.includes("registered")
        ) {
          setUserAlreadyExists(true);
          setError("User already registered");
        } else {
          setError(
            result.error.message ||
              "Failed to create account. Please try again."
          );
        }
      } else {
        const user = result.data?.user;
        const session = result.data?.session;
        console.log("Account created successfully:", result.data);

        // Check if user needs email verification
        if (user && !session) {
          // User needs to verify email before being logged in
          setError(
            "Please check your email and click the verification link to complete your account setup."
          );
        } else if (session) {
          // User is automatically logged in or session was created
          onSignUpComplete();
        } else {
          setError(
            "Account created, but session not established. Check your email to verify."
          );
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-0 p-8 bg-white">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Create your password
          </DialogTitle>
        </div>

        <DialogDescription className="sr-only">
          Create a secure password for your HelperHub account.
        </DialogDescription>

        <div className="space-y-6">
          {/* Password Requirements */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600 leading-relaxed">
              Your password must contain at least:
            </p>
            <div className="space-y-2">
              <div
                className={`flex items-center gap-2 text-xs ${
                  hasMinLength ? "text-green-600" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasMinLength ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
                8 characters
              </div>
              <div
                className={`flex items-center gap-2 text-xs ${
                  hasLetter ? "text-green-600" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasLetter ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
                At least one letter
              </div>
              <div
                className={`flex items-center gap-2 text-xs ${
                  hasNumber ? "text-green-600" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasNumber ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
                At least one number
              </div>
              <div
                className={`flex items-center gap-2 text-xs ${
                  hasSpecialChar ? "text-green-600" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasSpecialChar ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
                At least one special character (!@#$%^&*...)
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`h-14 rounded-lg text-base placeholder:text-gray-500 focus:ring-0 pr-12 ${
                password && !isPasswordValid
                  ? "border-red-300 focus:border-red-400"
                  : "border-gray-200 focus:border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setAcceptedTerms(checked === true)
                }
                className="mt-0.5"
              />
              <label
                htmlFor="terms"
                className="text-xs text-gray-600 leading-relaxed cursor-pointer"
              >
                I agree to the{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  Privacy Policy
                </a>
                . By creating an account, I understand that I can connect with
                community members to give and receive help with various tasks
                and services.
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center">
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {userAlreadyExists ? (
              /* Show Login button when user already exists */
              <Button
                onClick={onSwitchToLogin}
                className="w-full h-14 bg-gray-700 hover:bg-gray-800 text-white rounded-full text-base font-medium transition-all"
              >
                Log In
              </Button>
            ) : (
              /* Show Sign Up button for new users */
              <Button
                onClick={handleSignUp}
                disabled={!canSignUp}
                className={`w-full h-14 text-white rounded-full text-base font-medium transition-all ${
                  canSignUp
                    ? "bg-gray-700 hover:bg-gray-800"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              disabled={loading}
              className="w-full h-12 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full disabled:opacity-50"
            >
              ← Go back
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
