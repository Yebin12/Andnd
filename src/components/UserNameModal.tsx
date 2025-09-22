import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface UserNameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onNext: (username: string) => void;
}

export function UserNameModal({ 
  open, 
  onOpenChange, 
  onBack, 
  onNext 
}: UserNameModalProps) {
  const [username, setUsername] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      // Position cursor after the @ symbol
      inputRef.current.setSelectionRange(1, 1);
    }
  }, [open]);

  // Reset username when modal opens
  useEffect(() => {
    if (open) {
      setUsername("@");
    }
  }, [open]);

  const handleInputChange = (value: string) => {
    // Ensure it always starts with @
    if (!value.startsWith("@")) {
      setUsername("@" + value.replace("@", ""));
    } else {
      setUsername(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent deleting the @ symbol
    if (e.key === "Backspace" && username.length <= 1) {
      e.preventDefault();
    }
    
    // Handle Enter key
    if (e.key === "Enter" && isUsernameValid) {
      handleNext();
    }
  };

  const handleNext = () => {
    if (!isUsernameValid) return;
    onNext(username);
  };

  // Validation: at least 5 characters total (@ + 4), so 4+ characters after @
  const isUsernameValid = username.length >= 5 && username.startsWith("@");
  const charactersAfterAt = username.slice(1).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-0 p-8 bg-white">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <DialogTitle className="text-xl font-semibold text-gray-900">Choose your username</DialogTitle>
        </div>
        
        <DialogDescription className="sr-only">
          Create a unique username for your HelperHub account.
        </DialogDescription>
        
        <div className="space-y-6">
          {/* Username Requirements */}
          <div className="text-center">
            <p className="text-sm text-gray-600 leading-relaxed">
              Your username should be at least 4 characters long (excluding the @ symbol) and will be how other community members can find and recognize you.
            </p>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="@username"
              value={username}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`h-14 rounded-lg text-base placeholder:text-gray-500 focus:ring-0 ${
                username.length > 1 && !isUsernameValid
                  ? 'border-red-300 focus:border-red-400' 
                  : 'border-gray-200 focus:border-gray-300'
              }`}
            />
            
            {/* Character count and validation */}
            <div className="flex items-center justify-between text-xs">
              <div className={`${charactersAfterAt >= 4 ? 'text-green-600' : 'text-gray-500'}`}>
                {charactersAfterAt >= 4 ? '✓' : '•'} At least 4 characters after @
              </div>
              <div className="text-gray-500">
                {charactersAfterAt}/20
              </div>
            </div>
            
            {/* Error message */}
            {username.length > 1 && !isUsernameValid && (
              <p className="text-xs text-red-500">Username must have at least 4 characters after the @ symbol</p>
            )}
          </div>

          {/* Username availability message */}
          {isUsernameValid && (
            <div className="text-center">
              <p className="text-xs text-green-600">
                ✓ Username looks good!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleNext}
              disabled={!isUsernameValid}
              className={`w-full h-14 text-white rounded-full text-base font-medium transition-all ${
                isUsernameValid 
                  ? 'bg-gray-700 hover:bg-gray-800' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Next
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full h-12 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full"
            >
              ← Go back
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}