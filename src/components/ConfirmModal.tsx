import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border-0 p-8 bg-white">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-900 text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2 text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-6">
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            className={`w-full h-12 text-white rounded-full text-base font-medium transition-all ${
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-700 hover:bg-gray-800"
            }`}
          >
            {confirmText}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full h-12 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full border-gray-200"
          >
            {cancelText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
