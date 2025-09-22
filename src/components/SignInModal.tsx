import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { UserNameModal } from "./UserNameModal";
import { PasswordModal } from "./PasswordModal";
import { YourInModal } from "./YourInModal";
import { authHelpers, utils } from "../lib/supabase";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticationComplete?: () => void;
  onSwitchToLogin?: () => void; // New prop to handle switching to login
}

export function SignInModal({ 
  open, 
  onOpenChange, 
  onAuthenticationComplete = () => {},
  onSwitchToLogin = () => {}
}: SignInModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    month: "",
    day: "",
    year: "",
    username: ""
  });
  const [useEmail, setUseEmail] = useState(false);
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [showNameError, setShowNameError] = useState(false);
  const [nameErrorType, setNameErrorType] = useState<"length" | "numbers" | "special-characters" | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showYourInModal, setShowYourInModal] = useState(false);

  // Refs for focusing inputs
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const monthSelectRef = useRef<HTMLButtonElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Clear dependent fields when parent fields change
      if (field === 'month') {
        newData.day = "";
        newData.year = "";
      } else if (field === 'day') {
        newData.year = "";
      }
      
      return newData;
    });
    
    // Reset errors when user starts typing again
    if (field === 'name') {
      setShowNameError(false);
    }
    if (field === 'phone' || field === 'email') {
      setShowPhoneError(false);
    }
  };

  // Validation functions
  const validateName = (name: string) => {
    const trimmedName = name.trim();
    
    // Check if name has less than 2 characters
    if (trimmedName.length < 2) {
      return { isValid: false, errorType: "length" };
    }
    
    // Check if name contains numbers
    if (/\d/.test(trimmedName)) {
      return { isValid: false, errorType: "numbers" };
    }
    
    // Check if name contains special characters (anything that's not letters or spaces)
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      return { isValid: false, errorType: "special-characters" };
    }
    
    // Check if after removing spaces, there are at least 2 letters
    const lettersOnly = trimmedName.replace(/\s/g, '');
    if (lettersOnly.length < 2) {
      return { isValid: false, errorType: "length" };
    }
    
    return { isValid: true, errorType: null };
  };

  const isNameValid = (name: string) => {
    return validateName(name).isValid;
  };

  const isPhoneValid = (phone: string) => {
    return phone.replace(/\D/g, '').length >= 10;
  };

  const validateEmail = (email: string) => {
    const trimmedEmail = email.trim();
    
    // Check if email is empty or too short
    if (trimmedEmail.length < 3) {
      return { isValid: false, errorType: "format" };
    }
    
    // Check if email contains @ symbol
    if (!trimmedEmail.includes('@')) {
      return { isValid: false, errorType: "missing-at" };
    }
    
    // Split email into local and domain parts
    const emailParts = trimmedEmail.split('@');
    
    // Check if there's exactly one @ symbol
    if (emailParts.length !== 2) {
      return { isValid: false, errorType: "format" };
    }
    
    const [localPart, domainPart] = emailParts;
    
    // Validate local part (before @)
    if (!localPart || localPart.length === 0) {
      return { isValid: false, errorType: "invalid-local" };
    }
    
    // Check for valid local part characters
    if (!/^[a-zA-Z0-9._-]+$/.test(localPart)) {
      return { isValid: false, errorType: "invalid-local" };
    }
    
    // Check for consecutive dots in local part
    if (localPart.includes('..')) {
      return { isValid: false, errorType: "invalid-local" };
    }
    
    // Check if local part starts or ends with dot, dash, or underscore
    if (/^[._-]|[._-]$/.test(localPart)) {
      return { isValid: false, errorType: "invalid-local" };
    }
    
    // Validate domain part (after @)
    if (!domainPart || domainPart.length < 3) {
      return { isValid: false, errorType: "invalid-domain" };
    }
    
    // Check if domain contains at least one dot
    if (!domainPart.includes('.')) {
      return { isValid: false, errorType: "invalid-domain" };
    }
    
    // Check for valid domain characters
    if (!/^[a-zA-Z0-9.-]+$/.test(domainPart)) {
      return { isValid: false, errorType: "invalid-domain" };
    }
    
    // Check for consecutive dots in domain
    if (domainPart.includes('..')) {
      return { isValid: false, errorType: "invalid-domain" };
    }
    
    // Check if domain starts or ends with dot or dash
    if (/^[.-]|[.-]$/.test(domainPart)) {
      return { isValid: false, errorType: "invalid-domain" };
    }
    
    // Split domain into parts and validate
    const domainParts = domainPart.split('.');
    
    // Check if all domain parts are valid
    for (const part of domainParts) {
      if (!part || part.length === 0) {
        return { isValid: false, errorType: "invalid-domain" };
      }
      // Each part should contain only letters, numbers, and hyphens (but not start/end with hyphen)
      if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(part)) {
        return { isValid: false, errorType: "invalid-domain" };
      }
    }
    
    // Check if the top-level domain (last part) is at least 2 characters and contains only letters
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
      return { isValid: false, errorType: "invalid-domain" };
    }
    
    return { isValid: true, errorType: null };
  };

  const isEmailValid = (email: string) => {
    return validateEmail(email).isValid;
  };

  const isDateOfBirthComplete = () => {
    return formData.month && formData.day && formData.year;
  };

  const isFormComplete = () => {
    const nameValid = isNameValid(formData.name);
    const phoneValid = useEmail ? isEmailValid(formData.email) : isPhoneValid(formData.phone);
    const dateComplete = isDateOfBirthComplete();
    
    return nameValid && phoneValid && dateComplete;
  };

  // Handle Enter key navigation
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const validation = validateName(formData.name);
      if (validation.isValid) {
        e.preventDefault();
        phoneInputRef.current?.focus();
      } else {
        // Show error when user tries to move forward with invalid name
        setShowNameError(true);
        setNameErrorType(validation.errorType as "length" | "numbers" | "special-characters");
      }
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (useEmail) {
        const emailValidation = validateEmail(formData.email);
        if (emailValidation.isValid) {
          e.preventDefault();
          monthSelectRef.current?.click();
        } else {
          setShowPhoneError(true);
        }
      } else {
        const phoneValid = isPhoneValid(formData.phone);
        if (phoneValid) {
          e.preventDefault();
          monthSelectRef.current?.click();
        } else {
          setShowPhoneError(true);
        }
      }
    }
  };

  // Handle blur event for phone/email field
  const handlePhoneBlur = () => {
    if (useEmail) {
      const hasInput = formData.email.length > 0;
      if (hasInput) {
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.isValid) {
          setShowPhoneError(true);
        }
      }
    } else {
      const phoneValid = isPhoneValid(formData.phone);
      const hasInput = formData.phone.length > 0;
      if (hasInput && !phoneValid) {
        setShowPhoneError(true);
      }
    }
  };

  // Handle blur event for name field
  const handleNameBlur = () => {
    const hasInput = formData.name.length > 0;
    
    if (hasInput) {
      const validation = validateName(formData.name);
      if (!validation.isValid) {
        setShowNameError(true);
        setNameErrorType(validation.errorType as "length" | "numbers" | "special-characters");
      }
    }
  };

  const handleSwitchToLoginFromPassword = () => {
    // Close all SignInModal related modals
    setShowPasswordModal(false);
    setShowUsernameModal(false);
    setShowYourInModal(false);
    
    // Close the main SignInModal and call the switch function
    onOpenChange(false);
    
    // Reset form data to clean state
    setFormData({
      name: "",
      phone: "",
      email: "",
      month: "",
      day: "",
      year: "",
      username: ""
    });
    setUseEmail(false);
    setShowPhoneError(false);
    setShowNameError(false);
    
    // Switch to login modal
    onSwitchToLogin();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete()) return;
    
    console.log("Sign up form submitted:", formData);
    // Transition to username modal instead of closing
    setShowUsernameModal(true);
  };

  const handleUsernameBack = () => {
    setShowUsernameModal(false);
  };

  const handleUsernameComplete = (username: string) => {
    console.log("Username set successfully:", username);
    // Store username in form data
    setFormData(prev => ({ ...prev, username }));
    // Transition to password modal
    setShowUsernameModal(false);
    setShowPasswordModal(true);
  };

  const handlePasswordBack = () => {
    setShowPasswordModal(false);
    setShowUsernameModal(true);
  };

  const handleSignUpComplete = () => {
    console.log("Password step completed, showing celebration!");
    // Transition to YourInModal
    setShowPasswordModal(false);
    setShowYourInModal(true);
  };

  const handleYourInComplete = () => {
    console.log("Account creation process completed!");
    // Trigger authentication state change
    onAuthenticationComplete();
    // Close all modals and reset form
    setShowYourInModal(false);
    onOpenChange(false);
    setFormData({
      name: "",
      phone: "",
      email: "",
      month: "",
      day: "",
      year: "",
      username: ""
    });
    setUseEmail(false);
    setShowPhoneError(false);
    setShowNameError(false);
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      // Reset all modal states when main modal closes
      setShowUsernameModal(false);
      setShowPasswordModal(false);
      setShowYourInModal(false);
    }
    onOpenChange(open);
  };

  const toggleContactMethod = () => {
    setUseEmail(!useEmail);
    setShowPhoneError(false); // Reset error state when switching
    setFormData(prev => ({
      ...prev,
      phone: "",
      email: ""
    }));
  };

  // Generate months
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate days
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  // Generate years (18+ years ago from current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - 18 - i).toString());

  return (
    <>
      <Dialog open={open && !showUsernameModal && !showPasswordModal && !showYourInModal} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md rounded-3xl border-0 p-8 bg-white">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <DialogTitle className="text-xl font-semibold text-gray-900">Create your account</DialogTitle>
          </div>
          
          <DialogDescription className="sr-only">
            Fill out this form to create your HelperHub account and start connecting with your community.
          </DialogDescription>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <Input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={handleNameBlur}
                className={`h-14 rounded-lg text-base placeholder:text-gray-500 focus:ring-0 ${
                  showNameError && !isNameValid(formData.name)
                    ? 'border-red-300 focus:border-red-400' 
                    : 'border-gray-200 focus:border-gray-300'
                }`}
                required
              />
              {showNameError && !isNameValid(formData.name) && (
                <div className="mt-1">
                  {nameErrorType === "length" && (
                    <p className="text-xs text-red-500">Name must be at least 2 characters long</p>
                  )}
                  {nameErrorType === "numbers" && (
                    <p className="text-xs text-red-500">Name can't be number</p>
                  )}
                  {nameErrorType === "special-characters" && (
                    <p className="text-xs text-red-500">Name can't include special characters</p>
                  )}
                </div>
              )}
            </div>

            {/* Phone/Email Field */}
            <div className="space-y-3">
              {useEmail ? (
                <Input
                  ref={phoneInputRef}
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onKeyDown={handlePhoneKeyDown}
                  onBlur={handlePhoneBlur}
                  className={`h-14 rounded-lg text-base placeholder:text-gray-500 focus:ring-0 ${
                    showPhoneError && (!isEmailValid(formData.email))
                      ? 'border-red-300 focus:border-red-400' 
                      : 'border-gray-200 focus:border-gray-300'
                  }`}
                  required
                />
              ) : (
                <Input
                  ref={phoneInputRef}
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  onKeyDown={handlePhoneKeyDown}
                  onBlur={handlePhoneBlur}
                  className={`h-14 rounded-lg text-base placeholder:text-gray-500 focus:ring-0 ${
                    showPhoneError && !isPhoneValid(formData.phone)
                      ? 'border-red-300 focus:border-red-400' 
                      : 'border-gray-200 focus:border-gray-300'
                  }`}
                  required
                />
              )}
              
              {/* Validation message */}
              {showPhoneError && !useEmail && !isPhoneValid(formData.phone) && (
                <p className="text-xs text-red-500">Phone number must contain at least 10 digits</p>
              )}
              {showPhoneError && useEmail && !isEmailValid(formData.email) && (
                <p className="text-xs text-red-500">Please provide a valid email</p>
              )}
              
              <button
                type="button"
                onClick={toggleContactMethod}
                className="text-blue-500 text-sm font-normal hover:underline"
              >
                {useEmail ? "Use phone instead" : "Use email instead"}
              </button>
            </div>

            {/* Date of Birth Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Date of birth</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Month */}
                <Select value={formData.month} onValueChange={(value) => handleInputChange("month", value)}>
                  <SelectTrigger 
                    ref={monthSelectRef}
                    className="h-14 rounded-xl border-gray-200 text-gray-500 focus:border-gray-300 focus:ring-0"
                  >
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200 max-h-48">
                    {months.map((month, index) => (
                      <SelectItem key={month} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Day - Expands after month is selected */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  formData.month 
                    ? 'max-w-full opacity-100' 
                    : 'max-w-0 opacity-0'
                }`}>
                  <Select 
                    value={formData.day} 
                    onValueChange={(value) => handleInputChange("day", value)}
                    disabled={!formData.month}
                  >
                    <SelectTrigger className="h-14 rounded-xl border-gray-200 text-gray-500 focus:border-gray-300 focus:ring-0 w-full">
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-200 max-h-48">
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year - Expands after day is selected */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  formData.day 
                    ? 'max-w-full opacity-100' 
                    : 'max-w-0 opacity-0'
                }`}>
                  <Select 
                    value={formData.year} 
                    onValueChange={(value) => handleInputChange("year", value)}
                    disabled={!formData.day}
                  >
                    <SelectTrigger className="h-14 rounded-xl border-gray-200 text-gray-500 focus:border-gray-300 focus:ring-0 w-full">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-200 max-h-48">
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={!isFormComplete()}
                className={`w-full h-14 text-white rounded-full text-base font-medium transition-all ${
                  isFormComplete() 
                    ? 'bg-gray-700 hover:bg-gray-800' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Next
              </Button>
            </div>
          </form>

          {/* Already have an account? Log in */}
          <div className="text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-500 hover:underline font-medium"
              >
                Log in
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <UserNameModal
        open={showUsernameModal}
        onOpenChange={setShowUsernameModal}
        onBack={handleUsernameBack}
        onNext={handleUsernameComplete}
      />

      <PasswordModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
        onBack={handlePasswordBack}
        onSignUpComplete={handleSignUpComplete}
        onSwitchToLogin={handleSwitchToLoginFromPassword}
        formData={formData}
      />

      <YourInModal
        open={showYourInModal}
        onOpenChange={setShowYourInModal}
        onComplete={handleYourInComplete}
        isSignUp={true}
      />
    </>
  );
}