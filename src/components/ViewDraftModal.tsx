import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ArrowLeft, MoreHorizontal } from "lucide-react";

interface Draft {
  id: string;
  title: string;
  description: string;
  selectedCategories: string[];
  location: string;
  locationType: "online" | "in-person";
  emailContact: string;
  phoneContact: string;
  urgency:
    | "within today"
    | "within 2-3 days"
    | "within a week"
    | "no rush - whenever convenient";
  willingToPay: boolean;
  paymentType: "hourly" | "total";
  paymentAmount: string;
  pictures: string[];
  timestamp: string;
}

interface ViewDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft: (draft: Draft) => void;
  onDeleteDraft: (draftId: string) => void;
  drafts: Draft[];
}

export function ViewDraftModal({
  isOpen,
  onClose,
  onLoadDraft,
  onDeleteDraft,
  drafts,
}: ViewDraftModalProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;

    return date.toLocaleDateString();
  };

  const getDraftPreviewText = (draft: Draft) => {
    if (draft.title) return draft.title;
    if (draft.description) return draft.description.substring(0, 50) + "...";
    return "Untitled draft";
  };

  const handleLoadDraft = (draft: Draft) => {
    onLoadDraft(draft);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl h-[80vh] max-h-[700px] rounded-2xl border-2 border-gray-200 p-0 bg-white overflow-hidden flex flex-col shadow-lg">
        <DialogTitle className="sr-only">Drafts</DialogTitle>
        <DialogDescription className="sr-only">
          View and manage your saved draft posts.
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-medium text-gray-900">Drafts</h1>
          </div>
          <Button
            variant="ghost"
            className="text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-full px-4 py-2 h-auto"
          >
            Edit
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {drafts.length === 0 ? (
            <div className="text-center py-16 px-6">
              <p className="text-gray-500 text-base">
                You don't have any saved drafts
              </p>
            </div>
          ) : (
            <div>
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => handleLoadDraft(draft)}
                  className="p-6 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-base break-words leading-relaxed">
                        {getDraftPreviewText(draft)}
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        {formatDate(draft.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDraft(draft.id);
                      }}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <MoreHorizontal className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
