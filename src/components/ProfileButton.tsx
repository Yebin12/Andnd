import { Button } from "./ui/button";
import { User } from "lucide-react";

interface ProfileButtonProps {
  onLogout: () => void;
}

export function ProfileButton({ onLogout }: ProfileButtonProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="h-8 w-8 rounded-full"
      onClick={onLogout}
    >
      <User className="h-4 w-4" />
    </Button>
  );
}