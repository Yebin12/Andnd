import { useState } from "react";
import { Button } from "./ui/button";
import { Heart, Menu } from "lucide-react";
import { SignInModal } from "./SignInModal";
import { LoginModal } from "./LoginModal";
import { ProfileButton } from "./ProfileButton";

interface HeaderProps {
  onLogoClick?: () => void;
  isAuthenticated?: boolean;
  onAuthenticationComplete?: () => void;
  onLogout?: () => void;
  onPostClick?: () => void;
}

export function Header({
  onLogoClick,
  isAuthenticated = false,
  onAuthenticationComplete = () => {},
  onLogout = () => {},
  onPostClick = () => {},
}: HeaderProps) {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSwitchToLogin = () => {
    setShowSignInModal(false);
    setShowLoginModal(true);
  };

  const handleSwitchToSignIn = () => {
    setShowLoginModal(false);
    setShowSignInModal(true);
  };

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity"
            onClick={onLogoClick}
          >
            <Heart className="w-6 h-6 text-primary" />
            <span className="font-medium">HelperHub</span>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  className="bg-black hover:bg-gray-800 text-white rounded-full px-6"
                  onClick={onPostClick}
                >
                  Post
                </Button>
                <ProfileButton onLogout={onLogout} />
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setShowLoginModal(true)}>
                  Log In
                </Button>
                <Button onClick={() => setShowSignInModal(true)}>
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <SignInModal
        open={showSignInModal}
        onOpenChange={setShowSignInModal}
        onAuthenticationComplete={onAuthenticationComplete}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onAuthenticationComplete={onAuthenticationComplete}
        onSwitchToSignUp={handleSwitchToSignIn}
      />
    </>
  );
}
