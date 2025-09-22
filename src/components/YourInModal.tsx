import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";

interface YourInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  isSignUp?: boolean; // New prop to distinguish between sign up and sign in
}

export function YourInModal({ 
  open, 
  onOpenChange, 
  onComplete,
  isSignUp
}: YourInModalProps) {

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent 
        className="sm:max-w-md rounded-2xl border-0 p-8 bg-white [&>button]:hidden"
      >
        <DialogTitle className="sr-only">You are in!</DialogTitle>
        <DialogDescription className="sr-only">
          Welcome back! You've successfully signed in to your account.
        </DialogDescription>
        
        {/* Close button */}
        <button
          onClick={() => onComplete()}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Success Icon with green circular background */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">You are in!</h2>
            <p className="text-gray-500 max-w-sm">
              {isSignUp 
                ? "Welcome to HelperHub! Your account has been created successfully and you're now logged in." 
                : "Welcome back! You've successfully signed in to your account."
              }
            </p>
          </div>
          
          {/* Continue Button */}
          <Button
            onClick={onComplete}
            className="w-full bg-black hover:bg-gray-800 text-white rounded-full py-3 mt-6"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}