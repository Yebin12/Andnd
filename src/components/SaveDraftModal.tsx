import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface SaveDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SaveDraftModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
}: SaveDraftModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-3xl border-0 px-8 pt-6 pb-2 bg-white min-h-[400px]">
        <DialogHeader className="text-center mb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 text-center">
            Save Draft
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2 text-center">
            Would you like to save your current progress as a draft? You can
            return to it later.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col mt-4">
          <div className="border-t border-gray-200"></div>
          <Button
            variant="ghost"
            onClick={handleConfirm}
            className="w-full h-12 text-gray-900 hover:text-gray-900 hover:bg-transparent font-medium"
          >
            Save Draft
          </Button>
          <div className="border-t border-gray-200"></div>
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="w-full h-12 text-gray-600 hover:text-gray-600 hover:bg-transparent"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
